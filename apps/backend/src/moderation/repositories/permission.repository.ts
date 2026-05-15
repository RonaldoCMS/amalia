import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Permission } from '../../entities/permission.entity'
import { UserPermission } from '../../entities/user-permission.entity'
import { PermissionCategoryEnum } from '../../entities/permission.entity'

@Injectable()
export class PermissionRepository {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(UserPermission)
    private readonly userPermissionRepo: Repository<UserPermission>,
  ) {}

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionRepo.find({ order: { category: 'ASC', key: 'ASC' } })
  }

  async findPermissionByKey(key: string): Promise<Permission | null> {
    return this.permissionRepo.findOne({ where: { key } })
  }

  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return this.userPermissionRepo.find({
      where: { user: { id: userId } },
      relations: ['permission', 'grantedBy'],
    })
  }

  async grantPermission(userId: string, permissionId: string, grantedById: string): Promise<UserPermission> {
    const existing = await this.userPermissionRepo.findOne({
      where: { user: { id: userId }, permission: { id: permissionId } },
    })
    if (existing) return existing

    const up = this.userPermissionRepo.create({
      user: { id: userId } as any,
      permission: { id: permissionId } as any,
      grantedBy: { id: grantedById } as any,
    })
    return this.userPermissionRepo.save(up)
  }

  async revokePermission(userId: string, permissionId: string): Promise<void> {
    await this.userPermissionRepo.delete({
      user: { id: userId },
      permission: { id: permissionId },
    } as any)
  }

  async revokeAllPermissions(userId: string): Promise<void> {
    await this.userPermissionRepo.delete({ user: { id: userId } } as any)
  }

  async hasPermission(userId: string, permissionKey: string): Promise<boolean> {
    const count = await this.userPermissionRepo
      .createQueryBuilder('up')
      .innerJoin('up.permission', 'p')
      .innerJoin('up.user', 'u')
      .where('u.id = :userId', { userId })
      .andWhere('p.key = :key', { key: permissionKey })
      .getCount()
    return count > 0
  }

  async seedPermissions(permissions: { key: string; description: string; category: PermissionCategoryEnum }[]): Promise<void> {
    for (const p of permissions) {
      const existing = await this.permissionRepo.findOne({ where: { key: p.key } })
      if (!existing) {
        await this.permissionRepo.save(this.permissionRepo.create(p))
      }
    }
  }

  async getUsersWithPermission(permissionKey: string): Promise<string[]> {
    const results = await this.userPermissionRepo
      .createQueryBuilder('up')
      .innerJoin('up.permission', 'p')
      .innerJoin('up.user', 'u')
      .where('p.key = :key', { key: permissionKey })
      .select('u.id', 'userId')
      .getRawMany()
    return results.map(r => r.userId)
  }
}
