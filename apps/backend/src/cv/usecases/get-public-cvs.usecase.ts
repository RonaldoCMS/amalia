import { Injectable, NotFoundException } from '@nestjs/common'
import { CvRepository } from '../../shared/repositories/pg/cv.repository'
import { CvSession, PublicCvItem } from '@amalia/shared'
import { toSession } from './start-interview.usecase'

@Injectable()
export class GetPublicCvsUseCase {
  constructor(private readonly cvRepository: CvRepository) {}

  async getAll(): Promise<PublicCvItem[]> {
    const cvs = await this.cvRepository.findAllPublic(60)
    return cvs.map(cv => ({
      id: cv.id,
      username: cv.username,
      title: cv.cvData?.title ?? 'Software Developer',
      bio: cv.cvData?.bio ?? '',
      topSkills: (cv.cvData?.skills ?? []).slice(0, 5).map(s => s.name),
      amaliaStats: cv.amaliaStats ?? {
        challengesCompleted: 0,
        accuracy: 0,
        totalScore: 0,
        topLanguages: [],
        badges: [],
      },
      createdAt: cv.createdAt instanceof Date ? cv.createdAt.toISOString() : cv.createdAt,
    }))
  }

  async getByUsername(username: string): Promise<CvSession> {
    const cv = await this.cvRepository.findByUsername(username)
    if (!cv) throw new NotFoundException('CV non trovato')
    return toSession(cv)
  }
}
