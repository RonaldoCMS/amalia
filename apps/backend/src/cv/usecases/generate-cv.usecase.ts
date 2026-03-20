import { Injectable, NotFoundException } from '@nestjs/common'
import { CvRepository } from '../../shared/repositories/pg/cv.repository'
import { UserChallengeRepository } from '../../shared/repositories/pg/user-challenge.repository'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { ClaudeRepository } from '../../shared/repositories/claude.repository'
import { CvData, CvSession, CvSkill } from '@amalia/shared'
import { toSession } from './start-interview.usecase'
import { computeBadges } from '../cv.badges'

@Injectable()
export class GenerateCvUseCase {
  constructor(
    private readonly cvRepository: CvRepository,
    private readonly userChallengeRepository: UserChallengeRepository,
    private readonly userRepository: UserRepository,
    private readonly claudeRepository: ClaudeRepository,
  ) {}

  async execute(cvId: string, userId: string): Promise<CvSession> {
    const cv = await this.cvRepository.findByUserId(userId)
    if (!cv || cv.id !== cvId) throw new NotFoundException('Sessione CV non trovata')

    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundException('Utente non trovato')

    const stats = await this.userChallengeRepository.getStats(userId)
    const history = await this.userChallengeRepository.getHistory(userId)

    // Build verified languages from challenge history
    const verifiedLangs = new Set<string>()
    const langCount: Record<string, number> = {}
    for (const h of history) {
      if (h.correct) {
        verifiedLangs.add(h.challenge.language)
        langCount[h.challenge.language] = (langCount[h.challenge.language] ?? 0) + 1
      }
    }
    const topLanguages = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([lang]) => lang)

    const total = stats.correctCount + stats.wrongCount
    const accuracy = total > 0 ? Math.round((stats.correctCount / total) * 100) : 0

    const onboarding = user.onboarding
    const conversation = cv.messages
      .map(m => `${m.role === 'amalia' ? 'Amalia' : user.username}: ${m.content}`)
      .join('\n\n')

    let cvData: CvData
    try {
      const raw = await this.claudeRepository.sendMessage(
        this.buildGeneratePrompt(
          user.username,
          conversation,
          verifiedLangs,
          stats,
          total,
          accuracy,
          topLanguages,
          onboarding,
        ),
        'GENERATE_CV',
        2048,
      )
      cvData = this.parseCvData(raw, user.username, onboarding?.githubUrl ?? null)
    } catch {
      await this.cvRepository.updateStatus(cvId, 'error')
      throw new Error('CV generation failed. Please try again.')
    }

    const updatedStats = {
      ...cv.amaliaStats,
      challengesCompleted: total,
      accuracy,
      totalScore: stats.totalScore,
      topLanguages,
      badges: computeBadges(stats.correctCount, stats.wrongCount, stats.totalScore),
    }

    await this.cvRepository.updateCvData(cvId, cvData, updatedStats)

    const updated = await this.cvRepository.findByUserId(userId)
    return toSession(updated!)
  }

  private buildGeneratePrompt(
    username: string,
    conversation: string,
    verifiedLangs: Set<string>,
    stats: any,
    total: number,
    accuracy: number,
    topLanguages: string[],
    onboarding: any,
  ): string {
    const verifiedList = [...verifiedLangs].join(', ') || 'none'
    return `You are Amalia, AI of the Amalia programming challenge platform.
You have just completed a detailed interview with ${username} to create their professional CV.

=== INTERVIEW TRANSCRIPT ===
${conversation}

=== CERTIFIED PLATFORM DATA FROM AMALIA ===
- Challenges completed: ${total} (accuracy ${accuracy}%)
- Total score: ${stats.totalScore} points
- Languages verified by the platform: ${verifiedList}
- Declared role: ${onboarding?.jobType ?? 'not specified'}
- Years of experience: ${onboarding?.yearsOfExperience ?? 'not specified'}
- Goals: ${(onboarding?.goals ?? []).join(', ') || 'not specified'}
- GitHub: ${onboarding?.githubUrl ?? 'not specified'}

Generate the professional CV of ${username} as pure JSON (ZERO extra text, ZERO markdown):
{
  "name": "${username}",
  "title": "precise professional title in max 5 words (e.g. 'Full Stack TypeScript Developer')",
  "bio": "professional bio in first person, 2-3 engaging sentences summarizing who they are and what they're looking for",
  "email": null,
  "githubUrl": "${onboarding?.githubUrl ?? null}",
  "education": "degree or relevant certifications, single string (e.g. 'BSc Computer Science - University of Bologna, 2022') or null if not mentioned",
  "skills": [
    {"name": "SkillName", "verified": true_or_false, "level": "Beginner|Intermediate|Advanced|Expert"}
  ],
  "softSkills": ["soft skill 1", "soft skill 2", "soft skill 3"],
  "projects": [
    {"name": "Project name", "description": "1-2 sentence description with concrete impact", "technologies": ["Tech1", "Tech2"]}
  ],
  "experience": [
    {"title": "Role title", "company": "Company name or Freelance", "period": "year-year or year-present", "description": "responsibilities and results in 1-2 sentences"}
  ]
}

ABSOLUTE RULES:
- "verified": true ONLY for languages in: [${verifiedList}]
- "softSkills": extract from interview answers, 3-5 concrete soft skills (e.g. problem solving, communication, autonomy, attention to detail)
- "education": null if not explicitly mentioned
- bio must reflect the user's tone and goals, in first person
- Include ALL experiences and projects mentioned in the interview, even briefly
- If a section has no data → empty array []
- Valid JSON, no extra text, no markdown blocks`
  }

  private parseCvData(raw: string, username: string, githubUrl: string | null): CvData {
    const clean = raw.replace(/```json|```/g, '').trim()
    try {
      const parsed = JSON.parse(clean) as CvData
      // Ensure required fields
      parsed.name = parsed.name || username
      parsed.title = parsed.title || 'Software Developer'
      parsed.bio = parsed.bio || ''
      parsed.email = parsed.email ?? null
      parsed.githubUrl = parsed.githubUrl ?? githubUrl
      parsed.education = parsed.education ?? null
      parsed.softSkills = parsed.softSkills ?? []
      parsed.skills = parsed.skills ?? []
      parsed.projects = parsed.projects ?? []
      parsed.experience = parsed.experience ?? []
      return parsed
    } catch {
      throw new Error(`CV JSON non parsabile: ${raw.slice(0, 200)}`)
    }
  }
}

