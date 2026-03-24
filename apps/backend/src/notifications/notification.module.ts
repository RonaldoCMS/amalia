import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { FCMTokenController } from './fcm-token.controller';
import { SaveFCMTokenUseCase } from './usecases/save-fcm-token.usecase';
import { DeleteFCMTokenUseCase } from './usecases/delete-fcm-token.usecase';
import { FCMToken } from '../entities/fcm-token.entity';
import { FCMTokenRepository } from '../shared/repositories/pg/fcm-token.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FCMToken])],
  controllers: [NotificationController, FCMTokenController],
  providers: [
    NotificationService,
    SaveFCMTokenUseCase,
    DeleteFCMTokenUseCase,
    FCMTokenRepository,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
