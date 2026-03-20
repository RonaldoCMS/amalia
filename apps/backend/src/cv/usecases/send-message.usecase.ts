import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CvRepository } from '../../shared/repositories/pg/cv.repository'
import { ClaudeRepository } from '../../shared/repositories/claude.repository'
import { CvMessage, CvSendMessageResponse } from '@amalia/shared'
import { toSession } from './start-interview.usecase'

const TOTAL_QUESTIONS = 7

@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly cvRepository: CvRepository,
    private readonly claudeRepository: ClaudeRepository,
  ) {}

  async execute(cvId: string, userId: string, content: string): Promise<CvSendMessageResponse> {
    const cv = await this.cvRepository.findByUserId(userId)
    if (!cv || cv.id !== cvId) throw new NotFoundException('Sessione CV non trovata')
    if (cv.status !== 'interviewing') throw new BadRequestException('Intervista già completata')

    const userMessage: CvMessage = { role: 'user', content }
    const allMessages = [...cv.messages, userMessage]

    const userMessages = allMessages.filter(m => m.role === 'user')
    const isDone = userMessages.length >= TOTAL_QUESTIONS

    // Build Anthropic-format conversation
    const conversation = allMessages.map(m => ({
      role: (m.role === 'amalia' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content,
    }))

    const amaliaContent = await this.claudeRepository.sendConversation(
      this.buildSystemPrompt(cv.username, cv.amaliaStats, isDone),
      conversation,
      350,
    )

    const amaliaMessage: CvMessage = { role: 'amalia', content: amaliaContent }

    await this.cvRepository.appendMessages(cvId, [userMessage, amaliaMessage])

    if (isDone) {
      await this.cvRepository.updateStatus(cvId, 'generating')
    }

    return { message: amaliaMessage, isDone }
  }

  private buildSystemPrompt(username: string, stats: any, isDone: boolean): string {
    if (isDone) {
      return `Sei Amalia, AI assistente della piattaforma Amalia.
Hai appena ricevuto l'ultima risposta di ${username} nella sua intervista per il CV.
Concludi l'intervista: ringraziali calorosamente in 1-2 frasi, poi scrivi esattamente questa frase finale:
"Perfetto! Ho tutto quello che mi serve. Sto generando il tuo CV professionale... 🚀"
NON aggiungere nulla dopo quella frase.`
    }

    const langList = stats?.topLanguages?.join(', ') || 'non specificati'

    return `Sei Amalia, AI assistente della piattaforma Amalia (sfide di programmazione).
Stai conducendo un'intervista a ${username} per creare il suo CV professionale.

DATI PIATTAFORMA: ${stats?.challengesCompleted ?? 0} sfide completate, ${stats?.accuracy ?? 0}% accuratezza, ${stats?.totalScore ?? 0} punti, linguaggi principali: ${langList}

SEQUENZA DOMANDE (ESATTAMENTE in questo ordine, UNA alla volta):
1. Come ti presenteresti a un recruiter in 2-3 frasi? (elevator pitch professionale)
2. Che esperienze lavorative hai avuto? (ruoli, aziende, durata — anche stage/freelance)
3. Hai un titolo di studio o certificazioni rilevanti?
4. Descrivi 1-2 progetti di cui sei fiero: cosa hai fatto, con quali tecnologie, che impatto ha avuto?
5. Quali sono i tuoi punti di forza tecnici principali? Quali stack o strumenti usi meglio?
6. Come ti descriveresti come collega? Dimmi 3 soft skill che ti rappresentano davvero (es. problem solving, comunicazione, leadership, creatività...).
7. Cosa stai cercando professionalmente adesso? (lavoro full-time, freelance, crescita, cambio settore...)

REGOLE FERREE:
- Guarda la conversazione: conta le risposte dell'utente e poni la PROSSIMA domanda non ancora fatta
- Prima di ogni risposta: commenta brevemente ciò che l'utente ha detto (massimo 1 riga, varia il commento)
- MAI porre due domande insieme
- Massimo 4 righe totali per risposta
- Italiano, tono professionale ma caldo e umano
- Se una risposta è molto breve o generica, chiedi gentilmente un esempio concreto prima di andare avanti`
  }
}
