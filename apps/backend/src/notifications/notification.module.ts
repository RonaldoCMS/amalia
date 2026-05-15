import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { FCMTokenController } from './fcm-token.controller';
import { SaveFCMTokenUseCase } from './usecases/save-fcm-token.usecase';
import { DeleteFCMTokenUseCase } from './usecases/delete-fcm-token.usecase';
import { FCMToken } from '../entities/fcm-token.entity';
import { FCMTokenRepository } from '../shared/repositories/pg/fcm-token.repository';
import { WebPushSubscription } from '../entities/web-push-subscription.entity';
import { WebPushSubscriptionRepository } from '../shared/repositories/pg/web-push-subscription.repository';
import { WebPushService } from './web-push.service';
import { WebPushSubscriptionController } from './web-push-subscription.controller';
import { SaveWebPushSubscriptionUseCase } from './usecases/save-web-push-subscription.usecase';
import { DeleteWebPushSubscriptionUseCase } from './usecases/delete-web-push-subscription.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([FCMToken, WebPushSubscription])],
  controllers: [NotificationController, FCMTokenController, WebPushSubscriptionController],
  providers: [
    NotificationService,
    SaveFCMTokenUseCase,
    DeleteFCMTokenUseCase,
    FCMTokenRepository,
    WebPushSubscriptionRepository,
    WebPushService,
    SaveWebPushSubscriptionUseCase,
    DeleteWebPushSubscriptionUseCase,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
