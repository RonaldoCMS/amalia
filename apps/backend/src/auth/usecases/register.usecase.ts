import { Injectable, ConflictException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { RegisterRequest, AuthResponse } from '@amalia/shared'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UserRoleEnum } from '../../entities/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Permission } from '../../entities/permission.entity'
import { UserPermission } from '../../entities/user-permission.entity'
import { Repository } from 'typeorm'
import { User } from '../../entities/user.entity'

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(UserPermission)
    private readonly userPermissionRepo: Repository<UserPermission>,
  ) {}

  async execute(request: RegisterRequest): Promise<AuthResponse> {
    const existingByUsername = await this.userRepository.findByUsername(request.username)
    if (existingByUsername) throw new ConflictException('Username già in uso')

    const existingByEmail = await this.userRepository.findByEmail(request.email)
    if (existingByEmail) throw new ConflictException('Email già in uso')

    // Check if this is the first user → Founder
    const userCount = await this.userRepo.count()
    const role = userCount === 0 ? UserRoleEnum.Founder : UserRoleEnum.User

    const hashed = await bcrypt.hash(request.password, 10)
    const user = await this.userRepository.save({
      username: request.username,
      email: request.email,
      password: hashed,
      role,
    })

    // If founder, grant all permissions
    if (role === UserRoleEnum.Founder) {
      const allPermissions = await this.permissionRepo.find()
      for (const perm of allPermissions) {
        await this.userPermissionRepo.save({
          user: { id: user.id },
          permission: { id: perm.id },
          grantedBy: null,
        })
      }
      console.log(`👑 First user "${user.username}" registered as Founder with all permissions`)
    }

    const accessToken = this.jwtService.sign({ sub: user.id, username: user.username, role: user.role })
    return { accessToken }
  }
}