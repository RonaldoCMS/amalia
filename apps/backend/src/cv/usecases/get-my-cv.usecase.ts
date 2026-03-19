import { Injectable, NotFoundException } from '@nestjs/common'
import { CvRepository } from '../../shared/repositories/pg/cv.repository'
import { CvSession } from '@amalia/shared'
import { toSession } from './start-interview.usecase'

@Injectable()
export class GetMyCvUseCase {
  constructor(private readonly cvRepository: CvRepository) {}

  async execute(userId: string): Promise<CvSession | null> {
    const cv = await this.cvRepository.findByUserId(userId)
    if (!cv) return null
    return toSession(cv)
  }
}
