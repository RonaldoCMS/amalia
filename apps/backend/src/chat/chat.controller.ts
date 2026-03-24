import {
  Controller, Get, Post, Param, Body, Request, UseGuards,
  UseInterceptors, UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { ChatService } from './chat.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { ChatMessageItem, SendMessageRequest } from '@amalia/shared'
import { FirebaseStorageService } from 'src/shared/firebase/firebase-storage.service'

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly firebaseStorage: FirebaseStorageService,
  ) {}

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
      storage: memoryStorage(),
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
  async uploadImage(
    @Param('matchId') matchId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: { id: string } },
  ): Promise<ChatMessageItem> {
    // Upload to Firebase Storage
    const imageUrl = await this.firebaseStorage.uploadFile(
      file.buffer,
      file.originalname,
      'chat',
    )

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
