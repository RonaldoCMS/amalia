import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { JobApplicationRepository } from '../../shared/repositories/pg/job-application.repository'
import { JobMessageRepository } from '../../shared/repositories/pg/job-message.repository'
import { NotificationService } from '../../notifications/notification.service'
import { JobMessageItem, NotificationType } from '@amalia/shared'

@Injectable()
export class SendJobMessageUseCase {
  constructor(
    private readonly jobApplicationRepository: JobApplicationRepository,
    private readonly jobMessageRepository: JobMessageRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(applicationId: string, userId: string, content: string): Promise<JobMessageItem> {
    const app = await this.jobApplicationRepository.findById(applicationId)
    if (!app) throw new NotFoundException('Candidatura non trovata')
    if (app.recruiterId !== userId && app.developerId !== userId) {
      throw new ForbiddenException('Non hai accesso a questa conversazione')
    }

    const msg = await this.jobMessageRepository.send(applicationId, userId, content)

    // If developer replies for the first time, update status
    if (userId === app.developerId && (app.status === 'sent' || app.status === 'viewed')) {
      await this.jobApplicationRepository.updateStatus(applicationId, 'replied')
    }

    // Notify the other party
    const partnerId = userId === app.recruiterId ? app.developerId : app.recruiterId
    const senderName = userId === app.recruiterId ? app.recruiter.username : app.developer.username
    const preview = content.slice(0, 50)

    await this.notificationService.notify(
      partnerId,
      NotificationType.JobOffer,
      `Messaggio da ${senderName}`,
      preview,
      applicationId,
    )

    return {
      id: msg.id,
      applicationId: msg.applicationId,
      senderId: msg.senderId,
      senderUsername: senderName,
      senderPhoto: (userId === app.recruiterId ? app.recruiter.profilePhotoUrl : app.developer.profilePhotoUrl) ?? null,
      content: msg.content ?? '',
      isOfferPreview: msg.isOfferPreview,
      read: msg.read,
      createdAt: msg.createdAt.toISOString(),
    }
  }
}
