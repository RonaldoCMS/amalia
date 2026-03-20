import { Injectable } from '@nestjs/common'
import { ClaudeRepository } from '../../shared/repositories/claude.repository'
import { ChallengeRepository } from '../../shared/repositories/pg/challenge.repository'
import { PROMPT_LANG_NAMES } from '../../shared/utils/prompt-language'
import { ChallengeResponse } from '@amalia/shared'

type ChallengeTranslation = { title: string; description: string; options: string[] }

const NON_EN_LANGS = Object.entries(PROMPT_LANG_NAMES).filter(([code]) => code !== 'en')

@Injectable()
export class TranslateChallengeUseCase {
  constructor(
    private readonly claudeRepository: ClaudeRepository,
    private readonly challengeRepository: ChallengeRepository,
  ) {}

  async execute(
    challengeId: string,
    challenge: ChallengeResponse,
    lang: string,
    cachedTranslations: Record<string, ChallengeTranslation>,
  ): Promise<ChallengeResponse> {
    if (lang === 'en') return challenge

    const cached = cachedTranslations?.[lang]
    if (cached) {
      return { ...challenge, title: cached.title, description: cached.description, options: cached.options }
    }

    // Translate into ALL languages at once
    const allTranslations = await this.translateAll(challenge)
    await this.challengeRepository.updateTranslations(challengeId, allTranslations)

    const t = allTranslations[lang]
    if (!t) return challenge
    return { ...challenge, title: t.title, description: t.description, options: t.options }
  }

  private async translateAll(challenge: ChallengeResponse): Promise<Record<string, ChallengeTranslation>> {
    const langMap: Record<string, string> = {}
    for (const [code, name] of NON_EN_LANGS) {
      langMap[code] = name
    }

    const payload = {
      title: challenge.title,
      description: challenge.description,
      options: challenge.options,
    }

    const system = `You are a professional translator. You will receive a JSON object with challenge data in English.
Translate it into ALL of these languages: ${Object.entries(langMap).map(([c, n]) => `${c} (${n})`).join(', ')}.

Respond with a JSON object where each key is a language code and each value contains the translated fields.
Do NOT translate programming code, variable names, function names, or technical identifiers.
For options that start with "A.", "B.", "C.", "D.", keep those letter prefixes unchanged.
Respond with valid JSON only. No extra text, no markdown, no backticks.

Example response format:
{
  "it": { "title": "...", "description": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."] },
  "de": { "title": "...", "description": "...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."] },
  ...
}`

    const raw = await this.claudeRepository.sendMessage(system, JSON.stringify(payload), 4096)
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean) as Record<string, ChallengeTranslation>

    // Validate: keep only known language codes with valid structure
    const validated: Record<string, ChallengeTranslation> = {}
    for (const [code] of NON_EN_LANGS) {
      const t = result[code]
      if (t?.title && t?.description && Array.isArray(t?.options)) {
        validated[code] = { title: t.title, description: t.description, options: t.options }
      }
    }
    return validated
  }
}
