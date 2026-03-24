import { Controller, Post, Body, Request, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { FeedService } from '../feed.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { PostItem, CreatePostRequest } from '@amalia/shared'
import { FirebaseStorageService } from 'src/shared/firebase/firebase-storage.service'

@Controller('feed')
@UseGuards(JwtGuard)
export class PostCreateFeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly firebaseStorage: FirebaseStorageService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Error('Solo immagini consentite'), false)
        } else {
          cb(null, true)
        }
      },
    }),
  )
  async create(
    @Body() body: CreatePostRequest,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Request() req: { user: { id: string } },
  ): Promise<PostItem> {
    let imageUrl: string | null = null

    if (file) {
      // Upload to Firebase Storage
      imageUrl = await this.firebaseStorage.uploadFile(
        file.buffer,
        file.originalname,
        'feed',
      )
    }

    return this.feedService.createPost(req.user.id, body.content, imageUrl)
  }
}
