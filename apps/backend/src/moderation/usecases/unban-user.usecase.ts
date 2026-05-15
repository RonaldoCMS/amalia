import { Injectable, NotFoundException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { ModerationLogRepository } from '../repositories/moderation-log.repository'
import { NotificationService } from '../../notifications/notification.service'
import { ModerationActionEnum } from '../../entities/moderation-log.entity'
import { NotificationType } from '@amalia/shared'

@Injectable()
export class UnbanUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly moderationLogRepository: ModerationLogRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(targetUserId: string, moderatorId: string): Promise<void> {
    const target = await this.userRepository.findById(targetUserId)
    if (!target) throw new NotFoundException('User not found')

    await this.userRepository.updateFields(targetUserId, {
      bannedUntil: null,
      banReason: null,
      chatBanUntil: null,
      challengeBanUntil: null,
      duelBanUntil: null,
    })

    await this.moderationLogRepository.create({
      moderatorId,
      targetUserId,
      action: ModerationActionEnum.Unban,
    })

    await this.notificationService.notify(
      targetUserId,
      NotificationType.UserUnbanned,
      'Account Unbanned',
      'Your account ban has been lifted',
    )
  }
}
