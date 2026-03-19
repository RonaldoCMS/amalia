import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { LoginRequest, AuthResponse } from '@amalia/shared'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(request: LoginRequest): Promise<AuthResponse> {
    const user = await this.userRepository.findByUsername(request.username)
    if (!user) throw new UnauthorizedException('Credenziali non valide')

    const valid = await bcrypt.compare(request.password, user.password)
    if (!valid) throw new UnauthorizedException('Credenziali non valide1')

    const accessToken = this.jwtService.sign({ sub: user.id, username: user.username })
    return { accessToken }
  }
}