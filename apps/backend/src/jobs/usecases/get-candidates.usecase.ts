import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { JobOfferRepository } from '../../shared/repositories/pg/job-offer.repository'
import { JobApplicationRepository } from '../../shared/repositories/pg/job-application.repository'
import { CvRepository } from '../../shared/repositories/pg/cv.repository'
import { UserChallengeRepository } from '../../shared/repositories/pg/user-challenge.repository'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { JobCandidateItem, ChallengeLevel, JobHardSkillReq } from '@amalia/shared'

const LEVEL_MAP: Record<string, number> = {
  [ChallengeLevel.Beginner]: 1,
  [ChallengeLevel.Intermediate]: 2,
  [ChallengeLevel.Hard]: 3,
}

function parseYears(raw: string | null | undefined): number {
  if (!raw) return 0
  if (raw === '10+') return 11
  const parts = raw.split('-')
  if (parts.length === 2) return Math.round((parseInt(parts[0]) + parseInt(parts[1])) / 2)
  const n = parseInt(raw)
  return isNaN(n) ? 0 : n
}

@Injectable()
export class GetCandidatesUseCase {
  constructor(
    private readonly jobOfferRepository: JobOfferRepository,
    private readonly jobApplicationRepository: JobApplicationRepository,
    private readonly cvRepository: CvRepository,
    private readonly userChallengeRepository: UserChallengeRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(offerId: string, userId: string): Promise<JobCandidateItem[]> {
    const offer = await this.jobOfferRepository.findById(offerId)
    if (!offer) throw new NotFoundException('Offerta non trovata')
    if (offer.authorId !== userId) throw new ForbiddenException('Non sei il proprietario di questa offerta')

    const publicCvs = await this.cvRepository.findAllPublic(200)

    const candidates: JobCandidateItem[] = []

    for (const cv of publicCvs) {
      // Skip the recruiter's own CV
      if (cv.userId === userId) continue

      // Skip devs already contacted for this offer
      const alreadySent = await this.jobApplicationRepository.existsForOfferAndDev(offerId, cv.userId)
      if (alreadySent) continue

      if (!cv.cvData) continue

      // Get verified skills from challenges
      const history = await this.userChallengeRepository.getHistory(cv.userId)
      const verifiedLangs = new Set<string>()
      const verifiedLangMaxLevel: Record<string, number> = {}

      for (const h of history) {
        if (h.correct) {
          const lang = h.challenge.language
          verifiedLangs.add(lang)
          const lvl = LEVEL_MAP[h.challenge.level] ?? 0
          verifiedLangMaxLevel[lang] = Math.max(verifiedLangMaxLevel[lang] ?? 0, lvl)
        }
      }

      const declaredSkillNames = (cv.cvData.skills ?? []).map(s => s.name.toLowerCase())
      const declaredSkillMap: Record<string, number> = {}
      for (const s of cv.cvData.skills ?? []) {
        declaredSkillMap[s.name.toLowerCase()] = LEVEL_MAP[s.level] ?? 1
      }

      // ── Hard Skill Score (55%) ──
      let hardSkillTotal = 0
      const matchedVerified: string[] = []
      const matchedDeclared: string[] = []

      const requiredHard: JobHardSkillReq[] = offer.hardSkills ?? []
      if (requiredHard.length > 0) {
        for (const req of requiredHard) {
          const nameL = req.name.toLowerCase()
          if (verifiedLangs.has(req.name) || verifiedLangs.has(nameL)) {
            hardSkillTotal += 100
            matchedVerified.push(req.name)
          } else if (declaredSkillNames.includes(nameL)) {
            hardSkillTotal += 40
            matchedDeclared.push(req.name)
          }
        }
        hardSkillTotal /= requiredHard.length
      } else {
        hardSkillTotal = 50 // No requirements = neutral score
      }

      // ── Level Score (25%) ──
      let levelTotal = 0
      if (requiredHard.length > 0) {
        for (const req of requiredHard) {
          const reqLvl = LEVEL_MAP[req.minLevel] ?? 1
          const nameL = req.name.toLowerCase()
          const devLvl = verifiedLangMaxLevel[req.name]
            ?? verifiedLangMaxLevel[nameL]
            ?? declaredSkillMap[nameL]
            ?? 0

          if (devLvl >= reqLvl) levelTotal += 100
          else if (devLvl === reqLvl - 1) levelTotal += 50
        }
        levelTotal /= requiredHard.length
      } else {
        levelTotal = 50
      }

      // ── Experience Score (20%) ──
      const user = await this.userRepository.findById(cv.userId)
      const devYears = parseYears(user?.onboarding?.yearsOfExperience)
      let experienceScore: number
      if (devYears >= offer.yearsRequired) experienceScore = 100
      else if (offer.yearsRequired - devYears <= 2) experienceScore = 60
      else experienceScore = 20

      const matchPercentage = Math.round(
        hardSkillTotal * 0.55 + levelTotal * 0.25 + experienceScore * 0.20,
      )

      const stats = cv.amaliaStats
      const total = stats ? stats.challengesCompleted : 0
      const accuracy = stats ? stats.accuracy : 0

      // Build matchedSkills array with level + verified flag
      const matchedSkills: { name: string; level: string; verified: boolean }[] = []
      for (const name of matchedVerified) {
        const nameL = name.toLowerCase()
        const lvl = verifiedLangMaxLevel[name] ?? verifiedLangMaxLevel[nameL] ?? 1
        const levelLabel = Object.entries(LEVEL_MAP).find(([, v]) => v === lvl)?.[0] ?? 'beginner'
        matchedSkills.push({ name, level: levelLabel, verified: true })
      }
      for (const name of matchedDeclared) {
        const nameL = name.toLowerCase()
        const lvl = declaredSkillMap[nameL] ?? 1
        const levelLabel = Object.entries(LEVEL_MAP).find(([, v]) => v === lvl)?.[0] ?? 'beginner'
        matchedSkills.push({ name, level: levelLabel, verified: false })
      }

      // Missing skills = required but not matched
      const allMatched = new Set([...matchedVerified.map(s => s.toLowerCase()), ...matchedDeclared.map(s => s.toLowerCase())])
      const missingSkills = requiredHard.filter(r => !allMatched.has(r.name.toLowerCase())).map(r => r.name)

      candidates.push({
        developerId: cv.userId,
        username: cv.username,
        profilePhotoUrl: user?.profilePhotoUrl ?? null,
        matchPercentage,
        yearsOfExperience: devYears,
        matchedSkills,
        missingSkills,
        verifiedSkills: matchedVerified,
        declaredSkills: matchedDeclared,
        challengesCompleted: total,
        accuracy,
        totalScore: stats?.totalScore ?? 0,
        cvTitle: cv.cvData.title ?? 'Developer',
        cvBio: (cv.cvData.bio ?? '').slice(0, 160),
      })
    }

    candidates.sort((a, b) => b.matchPercentage - a.matchPercentage)
    return candidates
  }
}
