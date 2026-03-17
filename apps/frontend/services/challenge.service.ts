import { ChallengeRepository } from '../repositories/challenge.repository'
import {
  GenerateChallengeRequest,
  EvaluateChallengeRequest,
  ChallengeResponse,
  EvaluationResponse,
  UserStats,
} from '@amalia/shared'

export class ChallengeService {
  private readonly repository: ChallengeRepository

  constructor() {
    this.repository = new ChallengeRepository()
  }

  generate(request: GenerateChallengeRequest): Promise<ChallengeResponse> {
    return this.repository.generate(request)
  }

  evaluate(request: EvaluateChallengeRequest): Promise<EvaluationResponse> {
    return this.repository.evaluate(request)
  }

  getStats(): Promise<UserStats> {
    return this.repository.getStats()
  }
}