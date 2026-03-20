import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { JobOfferRepository } from '../../shared/repositories/pg/job-offer.repository'
import { JobApplicationRepository } from '../../shared/repositories/pg/job-application.repository'
import { JobMessageRepository } from '../../shared/repositories/pg/job-message.repository'
import { NotificationService } from '../../notifications/notification.service'
import { NotificationType, SendOfferToDevsRequest } from '@amalia/shared'

@Injectable()
export class SendOfferToDevsUseCase {
  constructor(
    private readonly jobOfferRepository: JobOfferRepository,
    private readonly jobApplicationRepository: JobApplicationRepository,
    private readonly jobMessageRepository: JobMessageRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(offerId: string, userId: string, data: SendOfferToDevsRequest): Promise<{ sent: number }> {
    const offer = await this.jobOfferRepository.findById(offerId)
    if (!offer) throw new NotFoundException('Offerta non trovata')
    if (offer.authorId !== userId) throw new ForbiddenException('Non sei il proprietario di questa offerta')
    if (offer.status !== 'active') throw new ForbiddenException('Offerta non attiva')

    let sent = 0

    for (const devId of data.developerIds) {
      const exists = await this.jobApplicationRepository.existsForOfferAndDev(offerId, devId)
      if (exists) continue

      // We need match % — but caller already has it from candidates list
      // For now store 0, the candidate page shows the real score
      const app = await this.jobApplicationRepository.create(offerId, userId, devId, 0)

      // Create the first message as an offer preview
      const salaryText = offer.salaryMin && offer.salaryMax
        ? `${offer.salaryMin}K - ${offer.salaryMax}K`
        : offer.salaryMin
          ? `${offer.salaryMin}K`
          : 'Non specificata'

      const previewContent = `💼 ${offer.title}\n💰 RAL: ${salaryText}\n📍 ${offer.location ?? offer.workMode}`

      await this.jobMessageRepository.send(app.id, userId, previewContent, true)

      // Notify the developer
      await this.notificationService.notify(
        devId,
        NotificationType.JobOffer,
        `Nuova offerta: ${offer.title}`,
        `RAL: ${salaryText} — ${offer.sector}`,
        app.id,
      )

      sent++
    }

    return { sent }
  }
}
