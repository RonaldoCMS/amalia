import { Injectable, ConflictException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { RegisterRequest, AuthResponse } from '@amalia/shared'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(request: RegisterRequest): Promise<AuthResponse> {
    const existingByUsername = await this.userRepository.findByUsername(request.username)
    if (existingByUsername) throw new ConflictException('Username già in uso')

    const existingByEmail = await this.userRepository.findByEmail(request.email)
    if (existingByEmail) throw new ConflictException('Email già in uso')

    const hashed = await bcrypt.hash(request.password, 10)
    const user = await this.userRepository.save({
      username: request.username,
      email: request.email,
      password: hashed,
    })

    const accessToken = this.jwtService.sign({ sub: user.id, username: user.username })
    return { accessToken }
  }
}