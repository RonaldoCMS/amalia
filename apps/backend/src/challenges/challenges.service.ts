import { Injectable } from '@nestjs/common'
import {
  GenerateChallengeRequest,
  EvaluateChallengeRequest,
  ChallengeResponse,
  EvaluationResponse,
  UserStats,
} from '@amalia/shared'
import { GenerateChallengeUseCase } from './usecases/generate-challenge.usecase'
import { EvaluateChallengeUseCase } from './usecases/evaluate-challenge.usecase'
import { UserChallengeRepository } from '../shared/repositories/pg/user-challenge.repository'

@Injectable()
export class ChallengesService {
  constructor(
    private readonly generateChallengeUseCase: GenerateChallengeUseCase,
    private readonly evaluateChallengeUseCase: EvaluateChallengeUseCase,
    private readonly userChallengeRepository: UserChallengeRepository,
  ) {}

  generate(request: GenerateChallengeRequest, userId: string, lang?: string): Promise<ChallengeResponse> {
    return this.generateChallengeUseCase.execute(request, userId, lang)
  }

  evaluate(request: EvaluateChallengeRequest, userId: string, lang?: string): Promise<EvaluationResponse> {
    return this.evaluateChallengeUseCase.execute(request, userId, lang)
  }

  getStats(userId: string): Promise<UserStats> {
    return this.userChallengeRepository.getStats(userId)
  }
}