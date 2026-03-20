import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { JobOfferRepository } from '../../shared/repositories/pg/job-offer.repository'

@Injectable()
export class CloseOfferUseCase {
  constructor(private readonly jobOfferRepository: JobOfferRepository) {}

  async execute(offerId: string, userId: string): Promise<void> {
    const offer = await this.jobOfferRepository.findById(offerId)
    if (!offer) throw new NotFoundException('Offerta non trovata')
    if (offer.authorId !== userId) throw new ForbiddenException('Non sei il proprietario di questa offerta')

    await this.jobOfferRepository.updateStatus(offerId, 'closed')
  }
}
