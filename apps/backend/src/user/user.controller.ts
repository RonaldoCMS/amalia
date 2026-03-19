import { Controller, Get, Patch, Delete, Post, Body, Request, UseGuards, UseInterceptors, UploadedFile, HttpCode, HttpStatus, Query, Param } from '@nestjs/common'
import { UpdatePasswordRequest, UserProfile, ChallengeHistoryItem, UserSearchResult, PublicUserProfile } from '@amalia/shared'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { UserService } from './user.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
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

  @Patch('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  updatePassword(
    @Body() body: UpdatePasswordRequest,
    @Request() req: { user: { id: string } },
  ): Promise<void> {
    return this.userService.updatePassword(req.user.id, body)
  }

  @Post('photo')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'profile-photos'),
      filename: (req: any, file: any, cb: any) => {
        const ext = extname(file.originalname)
        cb(null, `${req.user.id}${ext}`)
      },
    }),
    fileFilter: (_req: any, file: any, cb: any) => {
      if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new Error('Only image files allowed'), false)
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  uploadPhoto(
    @UploadedFile() file: any,
    @Request() req: { user: { id: string } },
  ): Promise<{ profilePhotoUrl: string }> {
    return this.userService.updateProfilePhoto(req.user.id, file)
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAccount(@Request() req: { user: { id: string } }): Promise<void> {
    return this.userService.deleteAccount(req.user.id)
  }
}
