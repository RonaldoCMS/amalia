import { Module } from '@nestjs/common'
import { DuelsController } from './duels.controller'
import { DuelsService } from './duels.service'
import { NotificationModule } from '../notifications/notification.module'
import { SharedModule } from '../shared/shared.module'
import { ChallengesModule } from '../challenges/challenges.module'

@Module({
  imports: [SharedModule, NotificationModule, ChallengesModule],
  controllers: [DuelsController],
  providers: [DuelsService],
})
export class DuelsModule {}
