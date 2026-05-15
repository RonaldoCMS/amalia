import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { PermissionRepository } from '../repositories/permission.repository'
import { ModerationLogRepository } from '../repositories/moderation-log.repository'
import { NotificationService } from '../../notifications/notification.service'
import { UserRoleEnum } from '../../entities/user.entity'
import { ModerationActionEnum } from '../../entities/moderation-log.entity'
import { NotificationType } from '@amalia/shared'
import { ROLE_HIERARCHY } from '../role-hierarchy'

@Injectable()
export class RemoveRoleUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly moderationLogRepository: ModerationLogRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(targetUserId: string, moderatorId: string): Promise<void> {
    const target = await this.userRepository.findById(targetUserId)
    if (!target) throw new NotFoundException('User not found')

    const moderator = await this.userRepository.findById(moderatorId)
    if (!moderator) throw new NotFoundException('Moderator not found')

    if (target.role === UserRoleEnum.Founder) {
      throw new BadRequestException('Cannot remove Founder role')
    }

    if (target.role === UserRoleEnum.User) {
      throw new BadRequestException('User already has base role')
    }

    const modLevel = ROLE_HIERARCHY[moderator.role] ?? 0
    const targetLevel = ROLE_HIERARCHY[target.role] ?? 0
    if (targetLevel >= modLevel) {
      throw new ForbiddenException('Cannot remove role from a user with equal or higher role')
    }

    const oldRole = target.role
    await this.userRepository.updateFields(targetUserId, { role: UserRoleEnum.User })
    await this.permissionRepository.revokeAllPermissions(targetUserId)

    await this.moderationLogRepository.create({
      moderatorId,
      targetUserId,
      action: ModerationActionEnum.RemoveRole,
      details: { oldRole, newRole: UserRoleEnum.User },
    })

    await this.notificationService.notify(
      targetUserId,
      NotificationType.RoleRemoved,
      'Role Removed',
      `Your ${oldRole} role has been removed`,
    )
  }
}
