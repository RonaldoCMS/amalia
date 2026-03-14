import { Injectable } from '@nestjs/common'
import { ClaudeRepository } from '../../shared/repositories/claude.repository'
import { ChallengeRepository } from '../../shared/repositories/pg/challenge.repository'
import { UserChallengeRepository } from '../../shared/repositories/pg/user-challenge.repository'
import {
  GenerateChallengeRequest,
  ChallengeResponse,
  ChallengeType,
} from '@amelia/shared'

@Injectable()
export class GenerateChallengeUseCase {
  constructor(
    private readonly claudeRepository: ClaudeRepository,
    private readonly challengeRepository: ChallengeRepository,
    private readonly userChallengeRepository: UserChallengeRepository,
  ) {}

  async execute(request: GenerateChallengeRequest, userId: string): Promise<ChallengeResponse> {
    const existing = await this.challengeRepository.findUnseen(
      userId,
      request.type,
      request.level,
      request.language,
    )

    if (existing) {
      await this.userChallengeRepository.save(userId, existing.id)
      return {
        title: existing.title,
        description: existing.description,
        code: existing.code,
        options: existing.options,
        answer: existing.answer,
      }
    }

    const raw = await this.claudeRepository.sendMessage(
      this.buildSystemPrompt(),
      this.buildUserPrompt(request),
    )

    const parsed = this.parse(raw)

    const saved = await this.challengeRepository.save({
      type: request.type,
      level: request.level,
      language: request.language,
      ...parsed,
    })

    await this.userChallengeRepository.save(userId, saved.id)
    return parsed
  }

  private buildSystemPrompt(): string {
    return `Sei Amelia, una maestra di programmazione.
Generi esercizi di codice reali e didattici.
Rispondi SEMPRE e SOLO con JSON valido. Nessun testo extra, nessun markdown, nessun backtick.`
  }

  private buildUserPrompt(request: GenerateChallengeRequest): string {
    const typeDesc: Record<ChallengeType, string> = {
      [ChallengeType.Fill]: 'Completa il codice mancante — sostituisci una parte con ___BLANK___',
      [ChallengeType.Quiz]: 'Risposta multipla — cosa produce o cosa fa questo codice? Dai 4 opzioni (A,B,C,D)',
      [ChallengeType.Bug]: 'Trova il bug — inserisci UN solo errore intenzionale nel codice',
      [ChallengeType.Write]: 'Scrivi la funzione — mostra solo la firma e la descrizione',
    }

    return `Genera un esercizio di programmazione in ${request.language}.
Tipo: ${typeDesc[request.type]}
Livello: ${request.level}

Rispondi con questo JSON:
{
  "title": "titolo breve",
  "description": "descrizione in italiano, 1-2 frasi",
  "code": "codice da mostrare (usa \\n per newline)",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "answer": "risposta corretta"
}`
  }

  private parse(raw: string): ChallengeResponse {
    try {
      const clean = raw.replace(/```json|```/g, '').trim()
      return JSON.parse(clean)
    } catch {
      throw new Error(`Risposta Claude non parsabile: ${raw}`)
    }
  }
}