import { BadRequestException, Injectable } from '@nestjs/common'
import { JobOfferRepository } from '../../shared/repositories/pg/job-offer.repository'
import { CreateJobOfferRequest, JobOfferItem } from '@amalia/shared'

@Injectable()
export class CreateOfferUseCase {
  constructor(private readonly jobOfferRepository: JobOfferRepository) {}

  async execute(userId: string, data: CreateJobOfferRequest): Promise<JobOfferItem> {
    if (!data.title?.trim()) throw new BadRequestException('Titolo obbligatorio')
    if (!data.description?.trim()) throw new BadRequestException('Descrizione obbligatoria')
    if (!data.sector?.trim()) throw new BadRequestException('Settore obbligatorio')
    if (!data.expiresAt) throw new BadRequestException('Scadenza obbligatoria')

    const expiresAt = new Date(data.expiresAt)
    if (expiresAt <= new Date()) throw new BadRequestException('La scadenza deve essere futura')

    const offer = await this.jobOfferRepository.create(userId, data)

    return {
      id: offer.id,
      authorId: offer.authorId,
      authorUsername: offer.author.username,
      title: offer.title,
      description: offer.description,
      salaryMin: offer.salaryMin,
      salaryMax: offer.salaryMax,
      contractType: offer.contractType,
      workMode: offer.workMode,
      location: offer.location,
      sector: offer.sector,
      status: offer.status as any,
      applicationsCount: 0,
      createdAt: offer.createdAt.toISOString(),
    }
  }
}
