import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { UserRoleEnum } from '../../entities/user.entity'
import { ROLE_HIERARCHY } from '../../moderation/role-hierarchy'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    if (!user?.role) return false

    // Founder bypasses all role checks
    if (user.role === UserRoleEnum.Founder) return true

    const userLevel = ROLE_HIERARCHY[user.role] ?? 0
    const minRequired = Math.min(...requiredRoles.map(r => ROLE_HIERARCHY[r] ?? 0))

    return userLevel >= minRequired
  }
}
