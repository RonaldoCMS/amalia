import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { ChallengesService } from '../challenges.service'
import { UserStats } from '@amalia/shared'
import { JwtGuard } from '../../auth/guards/jwt.guard'

@Controller('challenges')
@UseGuards(JwtGuard)
export class GetStatsChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Get('stats')
  getStats(@Request() req: { user: { id: string } }): Promise<UserStats> {
    return this.challengesService.getStats(req.user.id)
  }
}
