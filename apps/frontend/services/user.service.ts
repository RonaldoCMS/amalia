import { UserRepository } from '../repositories/user.repository'
import { UserProfile, UpdatePasswordRequest, ChallengeHistoryItem } from '@amelia/shared'

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
}
