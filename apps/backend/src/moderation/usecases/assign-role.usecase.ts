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
export class AssignRoleUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly moderationLogRepository: ModerationLogRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(targetUserId: string, moderatorId: string, newRole: UserRoleEnum): Promise<void> {
    const target = await this.userRepository.findById(targetUserId)
    if (!target) throw new NotFoundException('User not found')

    const moderator = await this.userRepository.findById(moderatorId)
    if (!moderator) throw new NotFoundException('Moderator not found')

    if (newRole === UserRoleEnum.Founder) {
      throw new BadRequestException('Cannot assign Founder role')
    }

    const modLevel = ROLE_HIERARCHY[moderator.role] ?? 0
    const newRoleLevel = ROLE_HIERARCHY[newRole] ?? 0

    // Can only assign roles below your own level
    if (newRoleLevel >= modLevel) {
      throw new ForbiddenException('Cannot assign a role equal or higher than your own')
    }

    const oldRole = target.role
    await this.userRepository.updateFields(targetUserId, { role: newRole })

    // If promoting to moderator, grant default moderation permissions
    if (newRole === UserRoleEnum.Moderator && oldRole === UserRoleEnum.User) {
      const defaultPerms = ['manage_reports', 'mute_users', 'delete_posts']
      for (const key of defaultPerms) {
        const perm = await this.permissionRepository.findPermissionByKey(key)
        if (perm) {
          await this.permissionRepository.grantPermission(targetUserId, perm.id, moderatorId)
        }
      }
    }

    // If promoting to admin, grant all moderation + admin permissions
    if (newRole === UserRoleEnum.Admin) {
      const adminPerms = ['manage_reports', 'ban_users', 'mute_users', 'delete_posts', 'manage_chat', 'manage_challenges', 'manage_users', 'manage_jobs', 'assign_moderator', 'view_stats']
      for (const key of adminPerms) {
        const perm = await this.permissionRepository.findPermissionByKey(key)
        if (perm) {
          await this.permissionRepository.grantPermission(targetUserId, perm.id, moderatorId)
        }
      }
    }

    await this.moderationLogRepository.create({
      moderatorId,
      targetUserId,
      action: ModerationActionEnum.AssignRole,
      details: { oldRole, newRole },
    })

    await this.notificationService.notify(
      targetUserId,
      NotificationType.RoleAssigned,
      'Role Updated',
      `You have been assigned the ${newRole} role`,
    )
  }
}
