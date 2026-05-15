import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { PermissionRepository } from '../repositories/permission.repository'
import { PermissionCategoryEnum } from '../../entities/permission.entity'

const PERMISSION_SEEDS = [
  // Moderation
  { key: 'manage_reports', description: 'View and manage user reports', category: PermissionCategoryEnum.Moderation },
  { key: 'ban_users', description: 'Ban and unban users', category: PermissionCategoryEnum.Moderation },
  { key: 'mute_users', description: 'Mute and unmute users', category: PermissionCategoryEnum.Moderation },
  { key: 'delete_posts', description: 'Delete posts and comments', category: PermissionCategoryEnum.Moderation },
  { key: 'manage_chat', description: 'Delete chat messages and ban from chat', category: PermissionCategoryEnum.Moderation },
  { key: 'manage_challenges', description: 'Manage challenges and ban from challenges', category: PermissionCategoryEnum.Moderation },
  // Admin
  { key: 'manage_users', description: 'View and manage all users', category: PermissionCategoryEnum.Admin },
  { key: 'manage_jobs', description: 'Manage job offers', category: PermissionCategoryEnum.Admin },
  { key: 'assign_moderator', description: 'Assign or remove moderator role', category: PermissionCategoryEnum.Admin },
  { key: 'view_stats', description: 'View platform statistics', category: PermissionCategoryEnum.Admin },
  // Founder
  { key: 'assign_admin', description: 'Assign or remove admin role', category: PermissionCategoryEnum.Founder },
  { key: 'view_advanced_stats', description: 'View advanced platform statistics and trends', category: PermissionCategoryEnum.Founder },
  { key: 'manage_permissions', description: 'Manage individual user permissions', category: PermissionCategoryEnum.Founder },
]

@Injectable()
export class PermissionsSeed implements OnModuleInit {
  private readonly logger = new Logger(PermissionsSeed.name)

  constructor(private readonly permissionRepository: PermissionRepository) {}

  async onModuleInit(): Promise<void> {
    await this.permissionRepository.seedPermissions(PERMISSION_SEEDS)
    this.logger.log(`Seeded ${PERMISSION_SEEDS.length} permissions`)
  }
}
