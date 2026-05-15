import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { PermissionRepository } from '../repositories/permission.repository'
import { ModerationLogRepository } from '../repositories/moderation-log.repository'
import { NotificationService } from '../../notifications/notification.service'
import { ModerationActionEnum } from '../../entities/moderation-log.entity'
import { NotificationType } from '@amalia/shared'
import { ROLE_HIERARCHY } from '../role-hierarchy'

@Injectable()
export class ManagePermissionsUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly moderationLogRepository: ModerationLogRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async grant(targetUserId: string, moderatorId: string, permissionKey: string): Promise<void> {
    const target = await this.userRepository.findById(targetUserId)
    if (!target) throw new NotFoundException('User not found')

    const moderator = await this.userRepository.findById(moderatorId)
    if (!moderator) throw new NotFoundException('Moderator not found')

    const modLevel = ROLE_HIERARCHY[moderator.role] ?? 0
    const targetLevel = ROLE_HIERARCHY[target.role] ?? 0
    if (targetLevel >= modLevel) {
      throw new ForbiddenException('Cannot manage permissions of a user with equal or higher role')
    }

    const permission = await this.permissionRepository.findPermissionByKey(permissionKey)
    if (!permission) throw new NotFoundException(`Permission ${permissionKey} not found`)

    await this.permissionRepository.grantPermission(targetUserId, permission.id, moderatorId)

    await this.moderationLogRepository.create({
      moderatorId,
      targetUserId,
      action: ModerationActionEnum.GrantPermission,
      details: { permissionKey },
    })

    await this.notificationService.notify(
      targetUserId,
      NotificationType.PermissionGranted,
      'Permission Granted',
      `You have been granted the "${permissionKey}" permission`,
    )
  }

  async revoke(targetUserId: string, moderatorId: string, permissionKey: string): Promise<void> {
    const target = await this.userRepository.findById(targetUserId)
    if (!target) throw new NotFoundException('User not found')

    const moderator = await this.userRepository.findById(moderatorId)
    if (!moderator) throw new NotFoundException('Moderator not found')

    const modLevel = ROLE_HIERARCHY[moderator.role] ?? 0
    const targetLevel = ROLE_HIERARCHY[target.role] ?? 0
    if (targetLevel >= modLevel) {
      throw new ForbiddenException('Cannot manage permissions of a user with equal or higher role')
    }

    const permission = await this.permissionRepository.findPermissionByKey(permissionKey)
    if (!permission) throw new NotFoundException(`Permission ${permissionKey} not found`)

    await this.permissionRepository.revokePermission(targetUserId, permission.id)

    await this.moderationLogRepository.create({
      moderatorId,
      targetUserId,
      action: ModerationActionEnum.RevokePermission,
      details: { permissionKey },
    })

    await this.notificationService.notify(
      targetUserId,
      NotificationType.PermissionRevoked,
      'Permission Revoked',
      `Your "${permissionKey}" permission has been revoked`,
    )
  }

  async getUserPermissions(userId: string) {
    return this.permissionRepository.getUserPermissions(userId)
  }

  async getAllPermissions() {
    return this.permissionRepository.findAllPermissions()
  }
}
