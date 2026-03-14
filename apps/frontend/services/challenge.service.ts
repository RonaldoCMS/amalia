import { ChallengeRepository } from '../repositories/challenge.repository'
import {
  GenerateChallengeRequest,
  EvaluateChallengeRequest,
  ChallengeResponse,
  EvaluationResponse,
} from '@amelia/shared'

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
}