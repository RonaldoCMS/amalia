import { Injectable } from '@nestjs/common'
import {
  GenerateChallengeRequest,
  EvaluateChallengeRequest,
  ChallengeResponse,
  EvaluationResponse,
} from '@amelia/shared'
import { GenerateChallengeUseCase } from './usecases/generate-challenge.usecase'
import { EvaluateChallengeUseCase } from './usecases/evaluate-challenge.usecase'

@Injectable()
export class ChallengesService {
  constructor(
    private readonly generateChallengeUseCase: GenerateChallengeUseCase,
    private readonly evaluateChallengeUseCase: EvaluateChallengeUseCase,
  ) {}

  generate(request: GenerateChallengeRequest, userId: string): Promise<ChallengeResponse> {
    return this.generateChallengeUseCase.execute(request, userId)
  }

  evaluate(request: EvaluateChallengeRequest, userId: string): Promise<EvaluationResponse> {
    return this.evaluateChallengeUseCase.execute(request, userId)
  }
}