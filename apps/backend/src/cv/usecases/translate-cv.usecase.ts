import { Injectable } from '@nestjs/common'
import { ClaudeRepository } from '../../shared/repositories/claude.repository'
import { CvRepository } from '../../shared/repositories/pg/cv.repository'
import { PROMPT_LANG_NAMES } from '../../shared/utils/prompt-language'
import { CvData } from '@amalia/shared'

const NON_EN_LANGS = Object.entries(PROMPT_LANG_NAMES).filter(([code]) => code !== 'en')

@Injectable()
export class TranslateCvUseCase {
  constructor(
    private readonly claudeRepository: ClaudeRepository,
    private readonly cvRepository: CvRepository,
  ) {}

  async execute(cvId: string, cvData: CvData, lang: string, cachedTranslations: Record<string, CvData>): Promise<CvData> {
    if (lang === 'en') return cvData

    const cached = cachedTranslations?.[lang]
    if (cached) return cached

    // Translate into ALL languages at once
    const allTranslations = await this.translateAll(cvData)
    await this.cvRepository.updateTranslations(cvId, allTranslations)

    return allTranslations[lang] ?? cvData
  }

  private async translateAll(cvData: CvData): Promise<Record<string, CvData>> {
    const payload = {
      title: cvData.title,
      bio: cvData.bio,
      education: cvData.education,
      softSkills: cvData.softSkills,
      skillLevels: cvData.skills.map(s => s.level),
      projectDescriptions: cvData.projects.map(p => p.description),
      experienceTitles: cvData.experience.map(e => e.title),
      experienceDescriptions: cvData.experience.map(e => e.description),
    }

    const system = `You are a professional translator. You will receive a JSON object with CV data in English.
Translate it into ALL of these languages: ${NON_EN_LANGS.map(([c, n]) => `${c} (${n})`).join(', ')}.

Respond with a JSON object where each key is a language code and each value contains the translated fields (title, bio, education, softSkills, skillLevels, projectDescriptions, experienceTitles, experienceDescriptions).
Do NOT translate proper nouns, company names, technology names, or programming language names.
Respond with valid JSON only. No extra text, no markdown, no backticks.

Example response format:
{
  "it": { "title": "...", "bio": "...", "education": "...", "softSkills": [...], "skillLevels": [...], "projectDescriptions": [...], "experienceTitles": [...], "experienceDescriptions": [...] },
  "de": { ... },
  ...
}`

    const raw = await this.claudeRepository.sendMessage(system, JSON.stringify(payload), 8192)
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    const allTranslations: Record<string, CvData> = {}
    for (const [code] of NON_EN_LANGS) {
      const t = result[code]
      if (!t) continue
      allTranslations[code] = {
        ...cvData,
        title: t.title ?? cvData.title,
        bio: t.bio ?? cvData.bio,
        education: t.education ?? cvData.education,
        softSkills: t.softSkills ?? cvData.softSkills,
        skills: cvData.skills.map((s, i) => ({
          ...s,
          level: t.skillLevels?.[i] ?? s.level,
        })),
        projects: cvData.projects.map((p, i) => ({
          ...p,
          description: t.projectDescriptions?.[i] ?? p.description,
        })),
        experience: cvData.experience.map((e, i) => ({
          ...e,
          title: t.experienceTitles?.[i] ?? e.title,
          description: t.experienceDescriptions?.[i] ?? e.description,
        })),
      }
    }
    return allTranslations
  }
}
