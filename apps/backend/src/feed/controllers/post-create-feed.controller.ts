import { Controller, Post, Body, Request, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import * as path from 'path'
import * as fs from 'fs'
import { FeedService } from '../feed.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { PostItem, CreatePostRequest } from '@amalia/shared'

@Controller('feed')
@UseGuards(JwtGuard)
export class PostCreateFeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = path.join(process.cwd(), 'uploads', 'feed')
          fs.mkdirSync(dir, { recursive: true })
          cb(null, dir)
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname)
          cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
        },
      }),
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
  create(
    @Body() body: CreatePostRequest,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Request() req: { user: { id: string } },
  ): Promise<PostItem> {
    const imageUrl = file ? `/uploads/feed/${file.filename}` : null
    return this.feedService.createPost(req.user.id, body.content, imageUrl)
  }
}
