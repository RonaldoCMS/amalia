import {
  Controller, Get, Post, Param, Body, Request, UseGuards,
  UseInterceptors, UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import * as path from 'path'
import * as fs from 'fs'
import { ChatService } from './chat.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { ChatMessageItem, SendMessageRequest } from '@amelia/shared'

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get(':matchId')
  getMessages(
    @Param('matchId') matchId: string,
    @Request() req: { user: { id: string } },
  ): Promise<ChatMessageItem[]> {
    return this.chatService.getMessages(matchId, req.user.id)
  }

  @Post(':matchId')
  sendMessage(
    @Param('matchId') matchId: string,
    @Body() body: SendMessageRequest,
    @Request() req: { user: { id: string } },
  ): Promise<ChatMessageItem> {
    return this.chatService.sendMessage(matchId, req.user.id, body)
  }

  @Post(':matchId/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = path.join(process.cwd(), 'uploads', 'chat')
          fs.mkdirSync(dir, { recursive: true })
          cb(null, dir)
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname)
          cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`)
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Error('Solo immagini consentite'), false)
        } else {
          cb(null, true)
        }
      },
    }),
  )
  uploadImage(
    @Param('matchId') matchId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: { id: string } },
  ): Promise<ChatMessageItem> {
    const imageUrl = `/uploads/chat/${file.filename}`
    return this.chatService.sendImage(matchId, req.user.id, imageUrl)
  }

  @Post(':matchId/system')
  sendSystemMessage(
    @Param('matchId') matchId: string,
    @Body() body: { content: string; duelInviteId?: string },
    @Request() req: { user: { id: string } },
  ): Promise<ChatMessageItem> {
    return this.chatService.sendSystemMessage(matchId, body.content, body.duelInviteId, req.user.id)
  }
}
