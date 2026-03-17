import { Controller, Get, Post, Delete, Param, Request, UseGuards } from '@nestjs/common'
import { MatchService } from './match.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { MatchSuggestion, MatchItem, LikeResponse } from '@amalia/shared'

@Controller('match')
@UseGuards(JwtGuard)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get('by/:matchId')
  getMatch(
    @Param('matchId') matchId: string,
    @Request() req: { user: { id: string } },
  ): Promise<MatchItem | null> {
    return this.matchService.getMatchById(matchId, req.user.id)
  }

  @Get('suggestions')
  getSuggestions(@Request() req: { user: { id: string } }): Promise<MatchSuggestion[]> {
    return this.matchService.getSuggestions(req.user.id)
  }

  @Get()
  getMatches(@Request() req: { user: { id: string } }): Promise<MatchItem[]> {
    return this.matchService.getMatches(req.user.id)
  }

  @Post('like/:userId')
  like(
    @Param('userId') toUserId: string,
    @Request() req: { user: { id: string } },
  ): Promise<LikeResponse> {
    return this.matchService.like(req.user.id, toUserId)
  }

  @Delete(':matchId')
  archiveMatch(
    @Param('matchId') matchId: string,
    @Request() req: { user: { id: string } },
  ): Promise<void> {
    return this.matchService.archiveMatch(matchId, req.user.id)
  }
}
