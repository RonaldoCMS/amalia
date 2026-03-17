import { Injectable } from '@nestjs/common'
import { UserChallengeRepository } from '../../shared/repositories/pg/user-challenge.repository'
import { ChallengeHistoryItem } from '@amalia/shared'

@Injectable()
export class GetHistoryUseCase {
  constructor(private readonly userChallengeRepository: UserChallengeRepository) {}

  execute(userId: string): Promise<ChallengeHistoryItem[]> {
    return this.userChallengeRepository.getHistory(userId)
  }
}
