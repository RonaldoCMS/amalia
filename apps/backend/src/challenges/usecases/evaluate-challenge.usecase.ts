import { Injectable } from '@nestjs/common'
import { ClaudeRepository } from '../../shared/repositories/claude.repository'
import { UserChallengeRepository } from '../../shared/repositories/pg/user-challenge.repository'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { getLanguageInstruction } from '../../shared/utils/prompt-language'
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
    private readonly userRepository: UserRepository,
  ) {}

  async execute(request: EvaluateChallengeRequest, userId: string, lang?: string): Promise<EvaluationResponse> {
    if (!lang) {
      const user = await this.userRepository.findById(userId)
      lang = user?.preferredLanguage ?? 'it'
    }

    const raw = await this.claudeRepository.sendMessage(
      this.buildSystemPrompt(lang),
      this.buildUserPrompt(request, lang),
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

  private buildSystemPrompt(lang: string): string {
    return `You are Amalia, a programming teacher.
You evaluate student answers precisely and educationally.
ALWAYS respond with valid JSON only. No extra text, no markdown, no backticks.${getLanguageInstruction(lang)}`
  }

  private buildUserPrompt(request: EvaluateChallengeRequest, lang: string): string {
    return `Evaluate this answer to a programming exercise.

Language: ${request.language}
Level: ${request.level}
Type: ${request.type}
Title: ${request.challenge.title}
Code shown: ${request.challenge.code}
Expected answer: ${request.challenge.answer}
Student answer: ${request.userAnswer}

Also consider a substantially equivalent answer as correct.

Respond with this JSON:
{
  "correct": true or false,
  "feedback": "explanation in 2-3 sentences"
}`
  }

  private parse(raw: string): { correct: boolean; feedback: string } {
    try {
      const clean = raw.replace(/```json|```/g, '').trim()
      return JSON.parse(clean)
    } catch {
      throw new Error(`Unparseable Claude response: ${raw}`)
    }
  }
}