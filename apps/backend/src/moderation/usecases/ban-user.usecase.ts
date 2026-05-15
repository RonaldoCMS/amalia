import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { ModerationLogRepository } from '../repositories/moderation-log.repository'
import { NotificationService } from '../../notifications/notification.service'
import { ModerationActionEnum } from '../../entities/moderation-log.entity'
import { UserRoleEnum } from '../../entities/user.entity'
import { NotificationType } from '@amalia/shared'
import { ROLE_HIERARCHY } from '../role-hierarchy'

@Injectable()
export class BanUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly moderationLogRepository: ModerationLogRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(targetUserId: string, moderatorId: string, data: {
    reason: string
    durationHours?: number | null
    banChat?: boolean
    banChallenge?: boolean
    banDuel?: boolean
  }): Promise<void> {
    const target = await this.userRepository.findById(targetUserId)
    if (!target) throw new NotFoundException('User not found')

    const moderator = await this.userRepository.findById(moderatorId)
    if (!moderator) throw new NotFoundException('Moderator not found')

    // Cannot ban users with equal or higher role
    const modLevel = ROLE_HIERARCHY[moderator.role] ?? 0
    const targetLevel = ROLE_HIERARCHY[target.role] ?? 0
    if (targetLevel >= modLevel) {
      throw new ForbiddenException('Cannot ban a user with equal or higher role')
    }

    const bannedUntil = data.durationHours
      ? new Date(Date.now() + data.durationHours * 3600_000)
      : new Date('2099-12-31') // "permanent"

    const updates: Record<string, unknown> = {
      bannedUntil,
      banReason: data.reason,
    }

    if (data.banChat) updates.chatBanUntil = bannedUntil
    if (data.banChallenge) updates.challengeBanUntil = bannedUntil
    if (data.banDuel) updates.duelBanUntil = bannedUntil

    await this.userRepository.updateFields(targetUserId, updates)

    await this.moderationLogRepository.create({
      moderatorId,
      targetUserId,
      action: ModerationActionEnum.Ban,
      details: { reason: data.reason, durationHours: data.durationHours, banChat: data.banChat, banChallenge: data.banChallenge, banDuel: data.banDuel },
    })

    await this.notificationService.notify(
      targetUserId,
      NotificationType.UserBanned,
      'Account Banned',
      `Your account has been banned: ${data.reason}`,
    )
  }
}
