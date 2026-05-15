import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { ModerationLogRepository } from '../repositories/moderation-log.repository'
import { NotificationService } from '../../notifications/notification.service'
import { ModerationActionEnum } from '../../entities/moderation-log.entity'
import { NotificationType } from '@amalia/shared'
import { ROLE_HIERARCHY } from '../role-hierarchy'

@Injectable()
export class MuteUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly moderationLogRepository: ModerationLogRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(targetUserId: string, moderatorId: string, data: {
    durationHours?: number | null
    muteChat?: boolean
    muteGlobal?: boolean
  }): Promise<void> {
    const target = await this.userRepository.findById(targetUserId)
    if (!target) throw new NotFoundException('User not found')

    const moderator = await this.userRepository.findById(moderatorId)
    if (!moderator) throw new NotFoundException('Moderator not found')

    const modLevel = ROLE_HIERARCHY[moderator.role] ?? 0
    const targetLevel = ROLE_HIERARCHY[target.role] ?? 0
    if (targetLevel >= modLevel) {
      throw new ForbiddenException('Cannot mute a user with equal or higher role')
    }

    const mutedUntil = data.durationHours
      ? new Date(Date.now() + data.durationHours * 3600_000)
      : new Date('2099-12-31')

    const updates: Record<string, unknown> = {}

    if (data.muteGlobal) {
      updates.isMuted = true
      updates.mutedUntil = mutedUntil
    }
    if (data.muteChat) {
      updates.chatBanUntil = mutedUntil
    }

    await this.userRepository.updateFields(targetUserId, updates)

    await this.moderationLogRepository.create({
      moderatorId,
      targetUserId,
      action: ModerationActionEnum.Mute,
      details: { durationHours: data.durationHours, muteChat: data.muteChat, muteGlobal: data.muteGlobal },
    })

    await this.notificationService.notify(
      targetUserId,
      NotificationType.UserMuted,
      'Account Muted',
      'Your account has been muted by a moderator',
    )
  }
}
