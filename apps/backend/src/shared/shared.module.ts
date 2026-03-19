import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ClaudeRepository } from './repositories/claude.repository'
import { UserRepository } from './repositories/pg/user.repository'
import { ChallengeRepository } from './repositories/pg/challenge.repository'
import { UserChallengeRepository } from './repositories/pg/user-challenge.repository'
import { UserOnboardingRepository } from './repositories/pg/user-onboarding.repository'
import { DevMatchRepository } from './repositories/pg/dev-match.repository'
import { ChatMessageRepository } from './repositories/pg/chat-message.repository'
import { NotificationRepository } from './repositories/pg/notification.repository'
import { DuelRepository } from './repositories/pg/duel.repository'
import { DuelRoundRepository } from './repositories/pg/duel-round.repository'
import { AppConfigRepository } from './repositories/pg/app-config.repository'
import { PostRepository } from './repositories/pg/post.repository'
import { PostLikeRepository } from './repositories/pg/post-like.repository'
import { PostCommentRepository } from './repositories/pg/post-comment.repository'
import { FriendshipRepository } from './repositories/pg/friendship.repository'
import { CvRepository } from './repositories/pg/cv.repository'
import { User } from '../entities/user.entity'
import { Challenge } from '../entities/challenge.entity'
import { UserChallenge } from '../entities/user-challenge.entity'
import { UserOnboarding } from '../entities/user-onboarding.entity'
import { DevMatch } from '../entities/dev-match.entity'
import { ChatMessage } from '../entities/chat-message.entity'
import { Notification } from '../entities/notification.entity'
import { Duel } from '../entities/duel.entity'
import { DuelRound } from '../entities/duel-round.entity'
import { AppConfig } from '../entities/app-config.entity'
import { Post } from '../entities/post.entity'
import { PostLike } from '../entities/post-like.entity'
import { PostComment } from '../entities/post-comment.entity'
import { Friendship } from '../entities/friendship.entity'
import { UserCv } from '../entities/user-cv.entity'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Challenge, UserChallenge, UserOnboarding, DevMatch, ChatMessage, Notification, Duel, DuelRound, AppConfig, Post, PostLike, PostComment, Friendship, UserCv])],
  providers: [
    ClaudeRepository,
    UserRepository,
    ChallengeRepository,
    UserChallengeRepository,
    UserOnboardingRepository,
    DevMatchRepository,
    ChatMessageRepository,
    NotificationRepository,
    DuelRepository,
    DuelRoundRepository,
    AppConfigRepository,
    PostRepository,
    PostLikeRepository,
    PostCommentRepository,
    FriendshipRepository,
    CvRepository,
  ],
  exports: [
    ClaudeRepository,
    UserRepository,
    ChallengeRepository,
    UserChallengeRepository,
    UserOnboardingRepository,
    DevMatchRepository,
    ChatMessageRepository,
    NotificationRepository,
    DuelRepository,
    DuelRoundRepository,
    AppConfigRepository,
    PostRepository,
    PostLikeRepository,
    PostCommentRepository,
    FriendshipRepository,
    CvRepository,
  ],
})
export class SharedModule {}