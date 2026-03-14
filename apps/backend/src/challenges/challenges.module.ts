import { Module } from '@nestjs/common'
import { ChallengesService } from './challenges.service'
import { PostGenerateChallengesController } from './controllers/post-generate-challenges.controller'
import { PostEvaluateChallengesController } from './controllers/post-evaluate-challenges.controller'
import { GenerateChallengeUseCase } from './usecases/generate-challenge.usecase'
import { EvaluateChallengeUseCase } from './usecases/evaluate-challenge.usecase'

@Module({
  controllers: [
    PostGenerateChallengesController,
    PostEvaluateChallengesController,
  ],
  providers: [
    ChallengesService,
    GenerateChallengeUseCase,
    EvaluateChallengeUseCase,
  ],
})
export class ChallengesModule {}