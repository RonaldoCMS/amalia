import { Injectable, NotFoundException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'

@Injectable()
export class UpdateProfilePhotoUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, firebaseUrl: string): Promise<{ profilePhotoUrl: string }> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundException('Utente non trovato')
    await this.userRepository.updateProfilePhoto(userId, firebaseUrl)
    return { profilePhotoUrl: firebaseUrl }
  }
}
