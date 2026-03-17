import { Module } from '@nestjs/common'
import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { NotificationModule } from '../notifications/notification.module'

@Module({
  imports: [NotificationModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
