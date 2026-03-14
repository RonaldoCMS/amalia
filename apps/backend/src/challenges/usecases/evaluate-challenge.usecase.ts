import { Injectable } from '@nestjs/common'
import { ClaudeRepository } from '../../shared/repositories/claude.repository'
import { UserChallengeRepository } from '../../shared/repositories/pg/user-challenge.repository'
import {
  EvaluateChallengeRequest,
  EvaluationResponse,
} from '@amelia/shared'

@Injectable()
export class EvaluateChallengeUseCase {
  constructor(
    private readonly claudeRepository: ClaudeRepository,
    private readonly userChallengeRepository: UserChallengeRepository,
  ) {}

  async execute(request: EvaluateChallengeRequest, userId: string): Promise<EvaluationResponse> {
    const raw = await this.claudeRepository.sendMessage(
      this.buildSystemPrompt(),
      this.buildUserPrompt(request),
    )

    return this.parse(raw)
  }

  private buildSystemPrompt(): string {
    return `Sei Amelia, una maestra di programmazione.
Valuti le risposte degli studenti in modo preciso e didattico.
Rispondi SEMPRE e SOLO con JSON valido. Nessun testo extra, nessun markdown, nessun backtick.`
  }

  private buildUserPrompt(request: EvaluateChallengeRequest): string {
    return `Valuta questa risposta a un esercizio di programmazione.

Linguaggio: ${request.language}
Livello: ${request.level}
Tipo: ${request.type}
Titolo: ${request.challenge.title}
Codice mostrato: ${request.challenge.code}
Risposta attesa: ${request.challenge.answer}
Risposta studente: ${request.userAnswer}

Considera corretta anche una risposta sostanzialmente equivalente a quella attesa.

Rispondi con questo JSON:
{
  "correct": true oppure false,
  "feedback": "spiegazione in italiano, 2-3 frasi"
}`
  }

  private parse(raw: string): EvaluationResponse {
    try {
      const clean = raw.replace(/```json|```/g, '').trim()
      return JSON.parse(clean)
    } catch {
      throw new Error(`Risposta Claude non parsabile: ${raw}`)
    }
  }
}