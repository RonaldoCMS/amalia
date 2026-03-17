import { Injectable, NotFoundException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'

@Injectable()
export class DeleteAccountUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundException('Utente non trovato')
    await this.userRepository.deleteById(userId)
  }
}
