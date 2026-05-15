import { Controller, Get, Patch, Delete, Post, Body, Request, UseGuards, UseInterceptors, UploadedFile, HttpCode, HttpStatus, Query, Param } from '@nestjs/common'
import { UpdatePasswordRequest, UserProfile, ChallengeHistoryItem, UserSearchResult, PublicUserProfile } from '@amalia/shared'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { BanGuard } from 'src/auth/guards/ban.guard'
import { UserService } from './user.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { FirebaseStorageService } from 'src/shared/firebase/firebase-storage.service'

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly firebaseStorage: FirebaseStorageService,
  ) {}

  @Get('me')
  @UseGuards(BanGuard)
  getProfile(@Request() req: { user: { id: string } }): Promise<UserProfile> {
    return this.userService.getProfile(req.user.id)
  }

  @Get('search')
  searchUsers(
    @Query('q') query: string,
    @Query('limit') limit: string = '20',
  ): Promise<UserSearchResult[]> {
    if (!query || query.trim().length === 0) return Promise.resolve([])
    return this.userService.searchUsers(query.trim(), Math.min(parseInt(limit) || 20, 50))
  }

  @Get('history')
  getHistory(@Request() req: { user: { id: string } }): Promise<ChallengeHistoryItem[]> {
    return this.userService.getHistory(req.user.id)
  }

  @Get(':userId/profile')
  getPublicProfile(@Param('userId') userId: string): Promise<PublicUserProfile> {
    return this.userService.getPublicProfile(userId)
  }

  @Get(':userId/challenge-history')
  getPublicHistory(@Param('userId') userId: string): Promise<ChallengeHistoryItem[]> {
    return this.userService.getHistory(userId)
  }

  @Patch('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  updatePassword(
    @Body() body: UpdatePasswordRequest,
    @Request() req: { user: { id: string } },
  ): Promise<void> {
    return this.userService.updatePassword(req.user.id, body)
  }

  @Patch('language')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateLanguage(
    @Body() body: { language: string },
    @Request() req: { user: { id: string } },
  ): Promise<void> {
    return this.userService.updateLanguage(req.user.id, body.language)
  }

  @Post('photo')
  @UseInterceptors(FileInterceptor('photo', {
    storage: memoryStorage(),
    fileFilter: (_req: any, file: any, cb: any) => {
      if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new Error('Only image files allowed'), false)
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: { id: string } },
  ): Promise<{ profilePhotoUrl: string }> {
    // Delete old profile photo if exists
    const profile = await this.userService.getProfile(req.user.id)
    if (profile.profilePhotoUrl) {
      await this.firebaseStorage.deleteFile(profile.profilePhotoUrl)
    }

    // Upload new photo to Firebase Storage
    const imageUrl = await this.firebaseStorage.uploadFile(
      file.buffer,
      file.originalname,
      'profile-photos',
    )

    return this.userService.updateProfilePhoto(req.user.id, imageUrl)
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAccount(@Request() req: { user: { id: string } }): Promise<void> {
    return this.userService.deleteAccount(req.user.id)
  }
}
