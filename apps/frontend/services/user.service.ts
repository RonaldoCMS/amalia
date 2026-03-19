import { UserRepository } from '../repositories/user.repository'
import { UserProfile, UpdatePasswordRequest, ChallengeHistoryItem, UserSearchResult, PublicUserProfile } from '@amalia/shared'

export class UserService {
  private readonly repository: UserRepository

  constructor() {
    this.repository = new UserRepository()
  }

  getProfile(): Promise<UserProfile> {
    return this.repository.getProfile()
  }

  updatePassword(request: UpdatePasswordRequest): Promise<void> {
    return this.repository.updatePassword(request)
  }

  deleteAccount(): Promise<void> {
    return this.repository.deleteAccount()
  }

  getHistory(): Promise<ChallengeHistoryItem[]> {
    return this.repository.getHistory()
  }

  searchUsers(query: string, limit?: number): Promise<UserSearchResult[]> {
    return this.repository.searchUsers(query, limit)
  }

  getPublicProfile(userId: string): Promise<PublicUserProfile> {
    return this.repository.getPublicProfile(userId)
  }
}
