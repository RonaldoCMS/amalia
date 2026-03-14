import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserChallenge } from 'src/entities/user-challenge.entity'
import { Repository } from 'typeorm'
 
@Injectable()
export class UserChallengeRepository {
  constructor(
    @InjectRepository(UserChallenge)
    private readonly repository: Repository<UserChallenge>,
  ) {}

  async save(userId: string, challengeId: string): Promise<UserChallenge> {
    return this.repository.save({ user: { id: userId }, challenge: { id: challengeId } })
  }
}