import { Body, Controller, Post, UseGuards, Request, Query } from '@nestjs/common'
import { ChallengesService } from '../challenges.service'
import { EvaluateChallengeRequest, EvaluationResponse } from '@amalia/shared'
import { JwtGuard } from '../../auth/guards/jwt.guard'

@Controller('challenges')
@UseGuards(JwtGuard)
export class PostEvaluateChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post('evaluate')
  evaluate(
    @Body() body: EvaluateChallengeRequest,
    @Request() req: { user: { id: string } },
    @Query('lang') lang?: string,
  ): Promise<EvaluationResponse> {
    return this.challengesService.evaluate(body, req.user.id, lang)
  }
}