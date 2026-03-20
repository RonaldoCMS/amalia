import { Injectable, NotFoundException } from '@nestjs/common'
import { CvRepository } from '../../shared/repositories/pg/cv.repository'
import { CvSession } from '@amalia/shared'
import { TranslateCvUseCase } from './translate-cv.usecase'
import { toSession } from './start-interview.usecase'

@Injectable()
export class GetMyCvUseCase {
  constructor(
    private readonly cvRepository: CvRepository,
    private readonly translateCvUseCase: TranslateCvUseCase,
  ) {}

  async execute(userId: string, lang?: string): Promise<CvSession | null> {
    const cv = await this.cvRepository.findByUserId(userId)
    if (!cv) return null

    const session = toSession(cv)

    if (session.cvData && lang && lang !== 'en') {
      try {
        session.cvData = await this.translateCvUseCase.execute(cv.id, session.cvData, lang, cv.translations ?? {})
      } catch { /* fallback to English */ }
    }

    return session
  }
}
