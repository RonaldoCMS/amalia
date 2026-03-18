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

    if (!user) {
      user = await this.userRepository.save({
        username: profile.username,
        email: profile.email,
        avatar: profile.avatar,
        githubId: profile.githubId,
        
        password: '',
      })
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      username: user.username,
    })

    return { accessToken }
  }
}