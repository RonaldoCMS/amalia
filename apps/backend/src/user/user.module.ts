import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { GetProfileUseCase } from './usecases/get-profile.usecase'
import { UpdatePasswordUseCase } from './usecases/update-password.usecase'
import { DeleteAccountUseCase } from './usecases/delete-account.usecase'
import { GetHistoryUseCase } from './usecases/get-history.usecase'
import { UpdateProfilePhotoUseCase } from './usecases/update-profile-photo.usecase'
import { SearchUsersUseCase } from './usecases/search-users.usecase'
import { GetPublicProfileUseCase } from './usecases/get-public-profile.usecase'
import { UpdateLanguageUseCase } from './usecases/update-language.usecase'
import { AuthModule } from '../auth/auth.module'
import { User } from '../entities/user.entity'

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User])],
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
    UpdateLanguageUseCase,
  ],
})
export class UserModule {}
