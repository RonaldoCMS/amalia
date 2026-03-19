import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { GetProfileUseCase } from './usecases/get-profile.usecase'
import { UpdatePasswordUseCase } from './usecases/update-password.usecase'
import { DeleteAccountUseCase } from './usecases/delete-account.usecase'
import { GetHistoryUseCase } from './usecases/get-history.usecase'
import { UpdateProfilePhotoUseCase } from './usecases/update-profile-photo.usecase'
import { SearchUsersUseCase } from './usecases/search-users.usecase'
import { GetPublicProfileUseCase } from './usecases/get-public-profile.usecase'

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    GetProfileUseCase,
    UpdatePasswordUseCase,
    DeleteAccountUseCase,
    GetHistoryUseCase,
    UpdateProfilePhotoUseCase,
    SearchUsersUseCase,
    GetPublicProfileUseCase,
  ],
})
export class UserModule {}
