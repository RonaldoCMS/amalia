import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { UpdatePasswordRequest } from '@amalia/shared'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UpdatePasswordUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, request: UpdatePasswordRequest): Promise<void> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundException('Utente non trovato')

    const valid = await bcrypt.compare(request.currentPassword, user.password)
    if (!valid) throw new UnauthorizedException('Password attuale non corretta')

    const hashed = await bcrypt.hash(request.newPassword, 10)
    await this.userRepository.updatePassword(userId, hashed)
  }
}
