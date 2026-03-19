import { Injectable } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { UserSearchResult } from '@amalia/shared'

@Injectable()
export class SearchUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: string, limit: number): Promise<UserSearchResult[]> {
    const users = await this.userRepository.searchByUsername(query, limit)
    return users.map(u => ({
      id: u.id,
      username: u.username,
      profilePhotoUrl: u.profilePhotoUrl,
      bio: u.onboarding?.bio ?? null,
    }))
  }
}
