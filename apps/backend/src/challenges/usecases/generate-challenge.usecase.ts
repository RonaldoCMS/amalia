import { Injectable } from '@nestjs/common'
import { ClaudeRepository } from '../../shared/repositories/claude.repository'
import { ChallengeRepository } from '../../shared/repositories/pg/challenge.repository'
import { UserChallengeRepository } from '../../shared/repositories/pg/user-challenge.repository'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { TranslateChallengeUseCase } from './translate-challenge.usecase'
import {
  GenerateChallengeRequest,
  ChallengeResponse,
  ChallengeType,
} from '@amalia/shared'

@Injectable()
export class GenerateChallengeUseCase {
  constructor(
    private readonly claudeRepository: ClaudeRepository,
    private readonly challengeRepository: ChallengeRepository,
    private readonly userChallengeRepository: UserChallengeRepository,
    private readonly userRepository: UserRepository,
    private readonly translateChallengeUseCase: TranslateChallengeUseCase,
  ) {}

  async execute(request: GenerateChallengeRequest, userId: string, lang?: string): Promise<ChallengeResponse> {
    const existing = await this.challengeRepository.findUnseen(
      userId,
      request.type,
      request.level,
      request.language,
    )

    if (!lang) {
      const user = await this.userRepository.findById(userId)
      lang = user?.preferredLanguage ?? 'en'
    }

    if (existing) {
      await this.userChallengeRepository.save(userId, existing.id)
      const response: ChallengeResponse = {
        id: existing.id,
        title: existing.title,
        description: existing.description,
        code: existing.code,
        options: existing.options,
        answer: existing.answer,
      }
      return this.translateChallengeUseCase.execute(existing.id, response, lang, existing.translations ?? {})
    }

    const raw = await this.claudeRepository.sendMessage(
      this.buildSystemPrompt(),
      this.buildUserPrompt(request),
    )

    const parsed = this.parse(raw);

    const saved = await this.challengeRepository.save({
      type: request.type,
      level: request.level,
      language: request.language,
      ...parsed,
    })

    await this.userChallengeRepository.save(userId, saved.id)
    const response: ChallengeResponse = { id: saved.id, ...parsed }
    return this.translateChallengeUseCase.execute(saved.id, response, lang, {})
  }

  private buildSystemPrompt(): string {
    return `You are Amalia, a programming teacher.
You generate real, educational coding exercises.
ALWAYS respond with valid JSON only. No extra text, no markdown, no backticks.`
  }

  private buildUserPrompt(request: GenerateChallengeRequest): string {
    const typeDesc: Record<ChallengeType, string> = {
      [ChallengeType.Fill]: 'Fill in the missing code — replace exactly ONE meaningful part with ___BLANK___',
      [ChallengeType.Quiz]: 'Multiple choice — what does this code produce or do? Give 4 options (A,B,C,D). IMPORTANT: choose a VARIED and UNEXPECTED topic every time. Rotate across themes such as: closures, type coercion, recursion, bitwise ops, string/array methods, prototype chain, async/promises, destructuring, generators, error handling, sorting, data structures, regex, memory/reference semantics, scope rules. Never repeat the same theme twice in a row.',
      [ChallengeType.Bug]: 'Find the bug — insert ONE intentional error in the code',
      [ChallengeType.Write]: 'Write the function body — show the function signature with __WRITE__ as the exact placeholder where the student must write the body',
    }

    const writeNote = request.type === ChallengeType.Write
      ? `\nFor Write type the "code" field MUST contain the placeholder __WRITE__ exactly once inside the function body. Example: "function sum(a, b) {\\n  __WRITE__\\n}". The student will replace __WRITE__ with their implementation.`
      : ''

    return `Generate a programming exercise in ${request.language}.
Type: ${typeDesc[request.type]}
Level: ${request.level}
${writeNote}
Respond with this JSON:
{
  "title": "short title",
  "description": "description in English, 1-2 sentences",
  "code": "code to display (use \\n for newline)",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "answer": "correct answer"
}

IMPORTANT: each option MUST be a single string in the array. Never split an option across multiple elements. If an option contains commas (e.g. "D. [2, 4, 6, 8]"), it must remain ONE single string element.
`

  }

  private parse(raw: string): ChallengeResponse {
    try {
      const clean = raw.replace(/```json|```/g, '').trim()
      const result = JSON.parse(clean) as ChallengeResponse
      if (result.options) {
        result.options = this.normalizeOptions(result.options)
      }
      return result
    } catch {
      throw new Error(`Unparseable Claude response: ${raw}`)
    }
  }

  private normalizeOptions(options: string[]): string[] {
    const merged: string[] = []
    for (const opt of options) {
      if (/^\s*[A-D]\./.test(opt)) {
        merged.push(opt)
      } else if (merged.length > 0) {
        merged[merged.length - 1] += ',' + opt
      }
    }
    return merged
  }
}