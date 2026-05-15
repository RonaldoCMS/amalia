import { Module } from '@nestjs/common';
import { ChallengesModule } from './challenges/challenges.module';
import { SharedModule } from './shared/shared.module';
import { FirebaseModule } from './shared/firebase/firebase.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Challenge } from './entities/challenge.entity';
import { UserChallenge } from './entities/user-challenge.entity';
import { UserOnboarding } from './entities/user-onboarding.entity';
import { DevMatch } from './entities/dev-match.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { Notification } from './entities/notification.entity';
import { Duel } from './entities/duel.entity';
import { DuelRound } from './entities/duel-round.entity';
import { AppConfig } from './entities/app-config.entity';
import { Post } from './entities/post.entity';
import { PostLike } from './entities/post-like.entity';
import { PostComment } from './entities/post-comment.entity';
import { Friendship } from './entities/friendship.entity';
import { UserCv } from './entities/user-cv.entity';
import { JobOffer } from './entities/job-offer.entity';
import { JobApplication } from './entities/job-application.entity';
import { JobMessage } from './entities/job-message.entity';
import { FCMToken } from './entities/fcm-token.entity';
import { WebPushSubscription } from './entities/web-push-subscription.entity';
import { Permission } from './entities/permission.entity';
import { UserPermission } from './entities/user-permission.entity';
import { Report } from './entities/report.entity';
import { ModerationLog } from './entities/moderation-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { MatchModule } from './match/match.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notifications/notification.module';
import { DuelsModule } from './duels/duels.module';
import { FeedModule } from './feed/feed.module';
import { FriendshipModule } from './friendship/friendship.module'; 
import { CvModule } from './cv/cv.module';
import { JobsModule } from './jobs/jobs.module'; 
import { ModerationModule } from './moderation/moderation.module';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath: '../../.env',  isGlobal: true }),
      TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, Challenge, UserChallenge, UserOnboarding, DevMatch, ChatMessage, Notification, Duel, DuelRound, AppConfig, Post, PostLike, PostComment, Friendship, UserCv, JobOffer, JobApplication, JobMessage, FCMToken, WebPushSubscription, Permission, UserPermission, Report, ModerationLog],
        synchronize: true,
      }),
    }),
    SharedModule,
    FirebaseModule,
    AuthModule,
    ChallengesModule,
    UserModule,
    OnboardingModule,
    MatchModule,
    ChatModule,
    NotificationModule,
    DuelsModule,
    FeedModule,
    FriendshipModule,
    CvModule,
    JobsModule,
    ModerationModule,
  ],
})
export class AppModule {}
