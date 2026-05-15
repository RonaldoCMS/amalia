import { Injectable, NotFoundException } from '@nestjs/common'
import { JobOfferRepository } from '../../shared/repositories/pg/job-offer.repository'
import { ModerationLogRepository } from '../repositories/moderation-log.repository'
import { NotificationService } from '../../notifications/notification.service'
import { ModerationActionEnum } from '../../entities/moderation-log.entity'

@Injectable()
export class ModDeleteJobUseCase {
  constructor(
    private readonly jobOfferRepository: JobOfferRepository,
    private readonly moderationLogRepository: ModerationLogRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(jobId: string, moderatorId: string, reason?: string): Promise<void> {
    const job = await this.jobOfferRepository.findById(jobId)
    if (!job) throw new NotFoundException('Job offer not found')

    await this.jobOfferRepository.updateStatus(jobId, 'removed')

    await this.moderationLogRepository.create({
      moderatorId,
      targetUserId: job.authorId,
      action: ModerationActionEnum.DeleteJob,
      details: { jobId, reason },
    })
  }
}
