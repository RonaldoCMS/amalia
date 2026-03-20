import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { JobApplicationRepository } from '../../shared/repositories/pg/job-application.repository'
import { JobMessageRepository } from '../../shared/repositories/pg/job-message.repository'
import { JobMessageItem } from '@amalia/shared'

@Injectable()
export class GetJobMessagesUseCase {
  constructor(
    private readonly jobApplicationRepository: JobApplicationRepository,
    private readonly jobMessageRepository: JobMessageRepository,
  ) {}

  async execute(applicationId: string, userId: string): Promise<JobMessageItem[]> {
    const app = await this.jobApplicationRepository.findById(applicationId)
    if (!app) throw new NotFoundException('Candidatura non trovata')
    if (app.recruiterId !== userId && app.developerId !== userId) {
      throw new ForbiddenException('Non hai accesso a questa conversazione')
    }

    const messages = await this.jobMessageRepository.getMessages(applicationId)
    await this.jobMessageRepository.markRead(applicationId, userId)

    return messages.map(m => ({
      id: m.id,
      applicationId: m.applicationId,
      senderId: m.sender?.id ?? m.senderId,
      senderUsername: m.sender?.username ?? '',
      senderPhoto: m.sender?.profilePhotoUrl ?? null,
      content: m.content ?? '',
      isOfferPreview: m.isOfferPreview,
      read: m.read,
      createdAt: m.createdAt.toISOString(),
    }))
  }
}
