import { Injectable } from '@nestjs/common'
import { JobOfferRepository } from '../../shared/repositories/pg/job-offer.repository'
import { JobApplicationRepository } from '../../shared/repositories/pg/job-application.repository'
import { JobOfferItem } from '@amalia/shared'

@Injectable()
export class GetMyOffersUseCase {
  constructor(
    private readonly jobOfferRepository: JobOfferRepository,
    private readonly jobApplicationRepository: JobApplicationRepository,
  ) {}

  async execute(userId: string): Promise<JobOfferItem[]> {
    const offers = await this.jobOfferRepository.findByAuthorId(userId)

    const items: JobOfferItem[] = []
    for (const o of offers) {
      // Auto-expire if past date
      if (o.status === 'active' && new Date(o.expiresAt) < new Date()) {
        await this.jobOfferRepository.updateStatus(o.id, 'expired')
        o.status = 'expired'
      }
      const count = await this.jobApplicationRepository.countByOfferId(o.id)
      items.push({
        id: o.id,
        authorId: o.authorId,
        authorUsername: o.author.username,
        title: o.title,
        description: o.description,
        salaryMin: o.salaryMin,
        salaryMax: o.salaryMax,
        contractType: o.contractType,
        workMode: o.workMode,
        location: o.location,
        sector: o.sector,
        status: o.status as any,
        applicationsCount: count,
        createdAt: o.createdAt.toISOString(),
      })
    }

    return items
  }
}
