import { Injectable, NotFoundException } from '@nestjs/common'
import { CvRepository } from '../../shared/repositories/pg/cv.repository'
import { CvSession, PublicCvItem } from '@amalia/shared'
import { TranslateCvUseCase } from './translate-cv.usecase'
import { toSession } from './start-interview.usecase'

@Injectable()
export class GetPublicCvsUseCase {
  constructor(
    private readonly cvRepository: CvRepository,
    private readonly translateCvUseCase: TranslateCvUseCase,
  ) {}

  async getAll(lang?: string): Promise<PublicCvItem[]> {
    const cvs = await this.cvRepository.findAllPublic(60)
    const items: PublicCvItem[] = []

    for (const cv of cvs) {
      let cvData = cv.cvData
      if (cvData && lang && lang !== 'en') {
        try {
          cvData = await this.translateCvUseCase.execute(cv.id, cvData, lang, cv.translations ?? {})
        } catch { /* fallback to English */ }
      }

      items.push({
        id: cv.id,
        username: cv.username,
        title: cvData?.title ?? 'Software Developer',
        bio: cvData?.bio ?? '',
        topSkills: (cvData?.skills ?? []).slice(0, 5).map(s => s.name),
        amaliaStats: cv.amaliaStats ?? {
          challengesCompleted: 0,
          accuracy: 0,
          totalScore: 0,
          topLanguages: [],
          badges: [],
        },
        createdAt: cv.createdAt instanceof Date ? cv.createdAt.toISOString() : cv.createdAt,
      })
    }

    return items
  }

  async getByUsername(username: string, lang?: string): Promise<CvSession> {
    const cv = await this.cvRepository.findByUsername(username)
    if (!cv) throw new NotFoundException('CV not found')

    const session = toSession(cv)

    if (session.cvData && lang && lang !== 'en') {
      try {
        session.cvData = await this.translateCvUseCase.execute(cv.id, session.cvData, lang, cv.translations ?? {})
      } catch { /* fallback to English */ }
    }

    return session
  }
}
