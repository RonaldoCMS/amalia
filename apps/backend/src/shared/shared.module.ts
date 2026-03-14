import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ClaudeRepository } from './repositories/claude.repository'
import { UserRepository } from './repositories/pg/user.repository'
import { ChallengeRepository } from './repositories/pg/challenge.repository'
import { UserChallengeRepository } from './repositories/pg/user-challenge.repository'
import { User } from '../entities/user.entity'
import { Challenge } from '../entities/challenge.entity'
import { UserChallenge } from '../entities/user-challenge.entity'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Challenge, UserChallenge])],
  providers: [ClaudeRepository, UserRepository, ChallengeRepository, UserChallengeRepository],
  exports: [ClaudeRepository, UserRepository, ChallengeRepository, UserChallengeRepository],
})
export class SharedModule {}