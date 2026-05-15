import { Injectable, NotFoundException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { PermissionRepository } from '../repositories/permission.repository'
import { AdminUserListResponse, AdminUserDetail, UserRole } from '@amalia/shared'

@Injectable()
export class GetAdminUsersUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async list(options: {
    page?: number
    limit?: number
    search?: string
  }): Promise<AdminUserListResponse> {
    const page = options.page ?? 1
    const limit = options.limit ?? 20

    const { users, total } = await this.userRepository.findAllPaginated({
      page,
      limit,
      search: options.search,
    })

    return {
      users: users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        profilePhotoUrl: u.profilePhotoUrl,
        role: u.role as UserRole,
        bannedUntil: u.bannedUntil?.toISOString() ?? null,
        isMuted: u.isMuted,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    }
  }

  async detail(userId: string): Promise<AdminUserDetail> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundException('User not found')

    const userPermissions = await this.permissionRepository.getUserPermissions(userId)

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      profilePhotoUrl: user.profilePhotoUrl,
      role: user.role as UserRole,
      bannedUntil: user.bannedUntil?.toISOString() ?? null,
      banReason: user.banReason,
      isMuted: user.isMuted,
      mutedUntil: user.mutedUntil?.toISOString() ?? null,
      chatBanUntil: user.chatBanUntil?.toISOString() ?? null,
      challengeBanUntil: user.challengeBanUntil?.toISOString() ?? null,
      duelBanUntil: user.duelBanUntil?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      permissions: userPermissions.map(up => ({
        id: up.id,
        permission: {
          id: up.permission.id,
          key: up.permission.key as any,
          description: up.permission.description,
          category: up.permission.category as any,
        },
        grantedBy: up.grantedBy ? { id: up.grantedBy.id, username: up.grantedBy.username } : null,
        grantedAt: up.grantedAt.toISOString(),
      })),
    }
  }
}
