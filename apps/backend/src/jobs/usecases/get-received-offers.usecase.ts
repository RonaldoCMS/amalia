import { Injectable } from '@nestjs/common'
import { JobApplicationRepository } from '../../shared/repositories/pg/job-application.repository'
import { JobApplicationItem, JobApplicationStatus } from '@amalia/shared'

@Injectable()
export class GetReceivedOffersUseCase {
  constructor(
    private readonly jobApplicationRepository: JobApplicationRepository,
  ) {}

  async execute(userId: string): Promise<JobApplicationItem[]> {
    const apps = await this.jobApplicationRepository.findByDeveloperId(userId)

    const items: JobApplicationItem[] = []
    for (const app of apps) {
      // Skip expired offers
      if (app.offer.status !== 'active' && app.offer.status !== 'closed') {
        if (new Date(app.offer.expiresAt) < new Date()) continue
      }

      // Auto mark as viewed
      if (app.status === 'sent') {
        await this.jobApplicationRepository.updateStatus(app.id, 'viewed')
        app.status = 'viewed'
      }

      items.push({
        id: app.id,
        offerId: app.offer.id,
        offerTitle: app.offer.title,
        salaryMin: app.offer.salaryMin,
        salaryMax: app.offer.salaryMax,
        contractType: app.offer.contractType,
        workMode: app.offer.workMode,
        location: app.offer.location,
        sector: app.offer.sector,
        recruiterUsername: app.recruiter.username,
        recruiterProfilePhotoUrl: app.recruiter.profilePhotoUrl ?? null,
        matchPercentage: app.matchPercentage,
        status: app.status as JobApplicationStatus,
        createdAt: app.createdAt.toISOString(),
      })
    }

    return items
  }
}
