import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common'
import { ChallengesService } from '../challenges.service'
import { GenerateChallengeRequest, ChallengeResponse } from '@amelia/shared'
import { JwtGuard } from '../../auth/guards/jwt.guard'

@Controller('challenges')
@UseGuards(JwtGuard)
export class PostGenerateChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post('generate')
  generate(
    @Body() body: GenerateChallengeRequest,
    @Request() req: { user: { id: string } },
  ): Promise<ChallengeResponse> {
    return this.challengesService.generate(body, req.user.id)
  }
}