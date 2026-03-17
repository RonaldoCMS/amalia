import { Injectable, NotFoundException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { UserProfile } from '@amalia/shared'

@Injectable()
export class GetProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundException('Utente non trovato')
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      profilePhotoUrl: user.profilePhotoUrl,
      createdAt: user.createdAt.toISOString(),
      onboardingCompleted: user.onboarding?.completed ?? false,
    }
  }
}
