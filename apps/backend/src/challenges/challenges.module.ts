import { Module } from '@nestjs/common'
import { ChallengesService } from './challenges.service'
import { PostGenerateChallengesController } from './controllers/post-generate-challenges.controller'
import { PostEvaluateChallengesController } from './controllers/post-evaluate-challenges.controller'
import { GetStatsChallengesController } from './controllers/get-stats-challenges.controller'
import { GenerateChallengeUseCase } from './usecases/generate-challenge.usecase'
import { EvaluateChallengeUseCase } from './usecases/evaluate-challenge.usecase'
import { TranslateChallengeUseCase } from './usecases/translate-challenge.usecase'

@Module({
  controllers: [
    PostGenerateChallengesController,
    PostEvaluateChallengesController,
    GetStatsChallengesController,
  ],
  providers: [
    ChallengesService,
    GenerateChallengeUseCase,
    EvaluateChallengeUseCase,
    TranslateChallengeUseCase,
  ],
  exports: [TranslateChallengeUseCase],
})
export class ChallengesModule {}