import { Module } from '@nestjs/common'
import { DuelsController } from './duels.controller'
import { DuelsService } from './duels.service'
import { NotificationModule } from '../notifications/notification.module'
import { SharedModule } from '../shared/shared.module'

@Module({
  imports: [SharedModule, NotificationModule],
  controllers: [DuelsController],
  providers: [DuelsService],
})
export class DuelsModule {}
