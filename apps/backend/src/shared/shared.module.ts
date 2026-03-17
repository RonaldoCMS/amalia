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

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Challenge, UserChallenge, UserOnboarding, DevMatch, ChatMessage, Notification, Duel, DuelRound, AppConfig])],
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
  ],
})
export class SharedModule {}