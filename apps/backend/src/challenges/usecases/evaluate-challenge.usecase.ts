import { Injectable } from '@nestjs/common'
import { ClaudeRepository } from '../../shared/repositories/claude.repository'
import { UserChallengeRepository } from '../../shared/repositories/pg/user-challenge.repository'
import {
  EvaluateChallengeRequest,
  EvaluationResponse,
  ChallengeType,
  ChallengeLevel,
} from '@amalia/shared'

const BASE_POINTS: Record<ChallengeType, number> = {
  [ChallengeType.Fill]: 5,
  [ChallengeType.Quiz]: 3,
  [ChallengeType.Bug]: 7,
  [ChallengeType.Write]: 10,
}

const LEVEL_MULTIPLIER: Record<ChallengeLevel, number> = {
  [ChallengeLevel.Beginner]: 1,
  [ChallengeLevel.Intermediate]: 3,
  [ChallengeLevel.Hard]: 5,
}

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

    const parsed = this.parse(raw)
    const score = parsed.correct
      ? BASE_POINTS[request.type] * LEVEL_MULTIPLIER[request.level]
      : 0

    if (request.challenge.id) {
      const uc = await this.userChallengeRepository.findByUserAndChallenge(
        userId,
        request.challenge.id,
      )
      if (uc) {
        await this.userChallengeRepository.updateResult(uc.id, parsed.correct, score)
      }
    }

    return { ...parsed, score }
  }

  private buildSystemPrompt(): string {
    return `Sei amalia, una maestra di programmazione.
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

  private parse(raw: string): { correct: boolean; feedback: string } {
    try {
      const clean = raw.replace(/```json|```/g, '').trim()
      return JSON.parse(clean)
    } catch {
      throw new Error(`Risposta Claude non parsabile: ${raw}`)
    }
  }
}