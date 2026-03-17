import { Injectable } from '@nestjs/common'
import { GetProfileUseCase } from './usecases/get-profile.usecase'
import { UpdatePasswordUseCase } from './usecases/update-password.usecase'
import { DeleteAccountUseCase } from './usecases/delete-account.usecase'
import { GetHistoryUseCase } from './usecases/get-history.usecase'
import { UpdateProfilePhotoUseCase } from './usecases/update-profile-photo.usecase'
import { UserProfile, UpdatePasswordRequest, ChallengeHistoryItem } from '@amelia/shared'

@Injectable()
export class UserService {
  constructor(
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    private readonly getHistoryUseCase: GetHistoryUseCase,
    private readonly updateProfilePhotoUseCase: UpdateProfilePhotoUseCase,
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
}
 