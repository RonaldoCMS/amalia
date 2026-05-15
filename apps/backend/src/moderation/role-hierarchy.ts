import { UserRoleEnum } from '../entities/user.entity'

export const ROLE_HIERARCHY: Record<string, number> = {
  [UserRoleEnum.User]: 0,
  [UserRoleEnum.Moderator]: 1,
  [UserRoleEnum.Admin]: 2,
  [UserRoleEnum.Founder]: 3,
}
