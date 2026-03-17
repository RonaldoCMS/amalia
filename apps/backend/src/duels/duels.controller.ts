import { Controller, Post, Delete, Get, Param, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common'
import { JwtGuard } from '../auth/guards/jwt.guard'
import { DuelsService } from './duels.service'
import { DuelAnswerRequest, DuelJoinQueueRequest } from '@amalia/shared'

@Controller('duels')
export class DuelsController {
  constructor(private readonly duelsService: DuelsService) {}

  @Get('leaderboard')
  getLeaderboard() {
    return this.duelsService.getLeaderboard()
  }

  @Get('queue/languages')
  getLanguageQueueCounts() {
    return this.duelsService.getLanguageQueueCounts()
  }

  @UseGuards(JwtGuard)
  @Post('queue')
  joinQueue(@Request() req: any, @Body() body: DuelJoinQueueRequest) {
    return this.duelsService.joinQueue(req.user.id, body?.language)
  }

  @UseGuards(JwtGuard)
  @Delete('queue')
  leaveQueue(@Request() req: any) {
    return this.duelsService.leaveQueue(req.user.id)
  }

  @UseGuards(JwtGuard)
  @Get('queue/status')
  getQueueStatus(@Request() req: any) {
    return this.duelsService.getQueueStatus(req.user.id)
  }

  @UseGuards(JwtGuard)
  @Get(':id/invite-status')
  getInviteStatus(@Param('id') id: string) {
    return this.duelsService.getInviteStatus(id)
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  getDuel(@Param('id') id: string, @Request() req: any) {
    return this.duelsService.getDuel(id, req.user.id)
  }

  @UseGuards(JwtGuard)
  @Post(':id/forfeit')
  forfeit(@Param('id') id: string, @Request() req: any) {
    return this.duelsService.forfeit(id, req.user.id)
  }

  @UseGuards(JwtGuard)
  @Post('invite/:targetUserId')
  inviteUser(
    @Param('targetUserId') targetUserId: string,
    @Body() body: { language?: string; chatMatchId?: string },
    @Request() req: any,
  ) {
    return this.duelsService.inviteUser(req.user.id, targetUserId, body?.language, body?.chatMatchId)
  }

  @UseGuards(JwtGuard)
  @Post(':id/answer')
  submitAnswer(
    @Param('id') id: string,
    @Body() body: DuelAnswerRequest,
    @Request() req: any,
  ) {
    return this.duelsService.submitAnswer(id, req.user.id, body.answer)
  }

  @UseGuards(JwtGuard)
  @Post(':id/accept')
  acceptInvite(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.duelsService.acceptInvite(id, req.user.id)
  }

  @UseGuards(JwtGuard)
  @Post(':id/expire')
  expireInvite(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.duelsService.expireInvite(id, req.user.id)
  }
}
