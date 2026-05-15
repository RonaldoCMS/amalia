import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator'
import { UserPermission } from '../../entities/user-permission.entity'
import { UserRoleEnum } from '../../entities/user.entity'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(UserPermission)
    private readonly userPermissionRepo: Repository<UserPermission>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    if (!user?.id) return false

    // Founder bypasses all permission checks
    if (user.role === UserRoleEnum.Founder) return true

    const userPermissions = await this.userPermissionRepo.find({
      where: { user: { id: user.id } },
      relations: ['permission'],
    })

    const userPermissionKeys = userPermissions.map(up => up.permission.key)
    return requiredPermissions.every(p => userPermissionKeys.includes(p))
  }
}
