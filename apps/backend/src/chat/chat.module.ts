import { Module } from '@nestjs/common'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { NotificationModule } from '../notifications/notification.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [NotificationModule, AuthModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
