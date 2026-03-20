import { Injectable, NotFoundException } from '@nestjs/common'
import { JobOfferRepository } from '../../shared/repositories/pg/job-offer.repository'
import { JobApplicationRepository } from '../../shared/repositories/pg/job-application.repository'
import { JobOfferDetail } from '@amalia/shared'

@Injectable()
export class GetOfferDetailUseCase {
  constructor(
    private readonly jobOfferRepository: JobOfferRepository,
    private readonly jobApplicationRepository: JobApplicationRepository,
  ) {}

  async execute(offerId: string): Promise<JobOfferDetail> {
    const offer = await this.jobOfferRepository.findById(offerId)
    if (!offer) throw new NotFoundException('Offerta non trovata')

    // Auto-expire
    if (offer.status === 'active' && new Date(offer.expiresAt) < new Date()) {
      await this.jobOfferRepository.updateStatus(offer.id, 'expired')
      offer.status = 'expired'
    }

    const count = await this.jobApplicationRepository.countByOfferId(offerId)

    return {
      id: offer.id,
      authorId: offer.authorId,
      authorUsername: offer.author.username,
      authorProfilePhotoUrl: offer.author.profilePhotoUrl ?? null,
      title: offer.title,
      description: offer.description,
      salaryMin: offer.salaryMin,
      salaryMax: offer.salaryMax,
      contractType: offer.contractType,
      workMode: offer.workMode,
      location: offer.location,
      yearsRequired: offer.yearsRequired,
      sector: offer.sector,
      hardSkills: offer.hardSkills,
      softSkills: offer.softSkills ?? [],
      status: offer.status as any,
      applicationsCount: count,
      expiresAt: offer.expiresAt instanceof Date ? offer.expiresAt.toISOString() : offer.expiresAt,
      createdAt: offer.createdAt.toISOString(),
    }
  }
}
