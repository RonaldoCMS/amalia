import { Injectable, NotFoundException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { ModerationLogRepository } from '../repositories/moderation-log.repository'
import { NotificationService } from '../../notifications/notification.service'
import { ModerationActionEnum } from '../../entities/moderation-log.entity'
import { NotificationType } from '@amalia/shared'

@Injectable()
export class UnmuteUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly moderationLogRepository: ModerationLogRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(targetUserId: string, moderatorId: string): Promise<void> {
    const target = await this.userRepository.findById(targetUserId)
    if (!target) throw new NotFoundException('User not found')

    await this.userRepository.updateFields(targetUserId, {
      isMuted: false,
      mutedUntil: null,
      chatBanUntil: null,
    })

    await this.moderationLogRepository.create({
      moderatorId,
      targetUserId,
      action: ModerationActionEnum.Unmute,
    })

    await this.notificationService.notify(
      targetUserId,
      NotificationType.UserUnmuted,
      'Account Unmuted',
      'Your mute has been lifted',
    )
  }
}
