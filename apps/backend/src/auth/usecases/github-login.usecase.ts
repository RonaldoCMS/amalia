import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { AuthResponse } from '@amalia/shared'

interface GithubProfile {
  githubId: string
  username: string
  email: string
  avatar: string
}

@Injectable()
export class GithubLoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(profile: GithubProfile): Promise<AuthResponse> {
    let user = await this.userRepository.findByGithubId(profile.githubId)

    if (!user && profile.email) {
      // Account esistente con la stessa email → collega il githubId
      user = await this.userRepository.findByEmail(profile.email)
      if (user) {
        await this.userRepository.save({ id: user.id, githubId: profile.githubId })
        user.githubId = profile.githubId
      }
    }

    if (!user) {
      // Nessun account trovato → crea nuovo
      user = await this.userRepository.save({
        username: profile.username,
        email: profile.email,
        profilePhotoUrl: profile.avatar,
        githubId: profile.githubId,
        password: '',
      });
    }

    await this.userRepository.updateProfilePhoto(user.id, profile.avatar);

    const accessToken = this.jwtService.sign({
      sub: user.id,
      username: user.username,
      role: user.role,
    })

    return { accessToken }
  }
}