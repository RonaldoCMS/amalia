import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common'
import { ChallengesService } from '../challenges.service'
import { EvaluateChallengeRequest, EvaluationResponse } from '@amelia/shared'
import { JwtGuard } from '../../auth/guards/jwt.guard'

@Controller('challenges')
@UseGuards(JwtGuard)
export class PostEvaluateChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post('evaluate')
  evaluate(
    @Body() body: EvaluateChallengeRequest,
    @Request() req: { user: { id: string } },
  ): Promise<EvaluationResponse> {
    return this.challengesService.evaluate(body, req.user.id)
  }
}