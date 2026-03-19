import { Injectable } from '@nestjs/common'
import { GetProfileUseCase } from './usecases/get-profile.usecase'
import { UpdatePasswordUseCase } from './usecases/update-password.usecase'
import { DeleteAccountUseCase } from './usecases/delete-account.usecase'
import { GetHistoryUseCase } from './usecases/get-history.usecase'
import { UpdateProfilePhotoUseCase } from './usecases/update-profile-photo.usecase'
import { SearchUsersUseCase } from './usecases/search-users.usecase'
import { GetPublicProfileUseCase } from './usecases/get-public-profile.usecase'
import { UserProfile, UpdatePasswordRequest, ChallengeHistoryItem, UserSearchResult, PublicUserProfile } from '@amalia/shared'

@Injectable()
export class UserService {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly getHistoryUseCase: GetHistoryUseCase,
    private readonly updateProfilePhotoUseCase: UpdateProfilePhotoUseCase,
    private readonly searchUsersUseCase: SearchUsersUseCase,
    private readonly getPublicProfileUseCase: GetPublicProfileUseCase,
  ) {}

  getProfile(userId: string): Promise<UserProfile> {
    return this.getProfileUseCase.execute(userId)
  }

  updatePassword(userId: string, request: UpdatePasswordRequest): Promise<void> {
    return this.updatePasswordUseCase.execute(userId, request)
  }

  deleteAccount(userId: string): Promise<void> {
    return this.deleteAccountUseCase.execute(userId)
  }

  getHistory(userId: string): Promise<ChallengeHistoryItem[]> {
    return this.getHistoryUseCase.execute(userId)
  }

  updateProfilePhoto(userId: string, file: any): Promise<{ profilePhotoUrl: string }> {
    return this.updateProfilePhotoUseCase.execute(userId, file)
  }

  searchUsers(query: string, limit: number): Promise<UserSearchResult[]> {
    return this.searchUsersUseCase.execute(query, limit)
  }

  getPublicProfile(userId: string): Promise<PublicUserProfile> {
    return this.getPublicProfileUseCase.execute(userId)
  }
}
 