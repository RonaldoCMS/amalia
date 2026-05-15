import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../entities/user.entity'

@Injectable()
export class BanGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest()
    if (!user?.id) return true // let other guards handle auth

    const dbUser = await this.userRepo.findOne({ where: { id: user.id }, select: ['id', 'bannedUntil', 'banReason'] })
    if (!dbUser) return true

    if (dbUser.bannedUntil) {
      if (new Date(dbUser.bannedUntil) > new Date()) {
        throw new ForbiddenException({
          banned: true,
          bannedUntil: dbUser.bannedUntil,
          banReason: dbUser.banReason,
          permanent: false,
        })
      }
      // Ban expired, clear it
      await this.userRepo.update(user.id, { bannedUntil: null, banReason: null })
    }

    return true
  }
}
