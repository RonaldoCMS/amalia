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

  generate(request: GenerateChallengeRequest, lang?: string): Promise<ChallengeResponse> {
    return this.repository.generate(request, lang)
  }

  evaluate(request: EvaluateChallengeRequest, lang?: string): Promise<EvaluationResponse> {
    return this.repository.evaluate(request, lang)
  }

  getStats(): Promise<UserStats> {
    return this.repository.getStats()
  }
}