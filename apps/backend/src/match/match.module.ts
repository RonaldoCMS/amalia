import { Module } from '@nestjs/common'
import { MatchController } from './match.controller'
import { MatchService } from './match.service'
import { NotificationModule } from '../notifications/notification.module'

@Module({
  imports: [NotificationModule],
  controllers: [MatchController],
  providers: [MatchService],
})
export class MatchModule {}
