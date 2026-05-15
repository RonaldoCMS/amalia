import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtGuard } from '../../auth/guards/jwt.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { PermissionsGuard } from '../../auth/guards/permissions.guard'
import { BanGuard } from '../../auth/guards/ban.guard'
import { Roles } from '../../auth/decorators/roles.decorator'
import { RequirePermission } from '../../auth/decorators/permissions.decorator'
import { UserRoleEnum } from '../../entities/user.entity'
import { BanUserUseCase } from '../usecases/ban-user.usecase'
import { UnbanUserUseCase } from '../usecases/unban-user.usecase'
import { MuteUserUseCase } from '../usecases/mute-user.usecase'
import { UnmuteUserUseCase } from '../usecases/unmute-user.usecase'
import { ModDeletePostUseCase } from '../usecases/mod-delete-post.usecase'
import { ModDeleteCommentUseCase } from '../usecases/mod-delete-comment.usecase'
import { ModDeleteMessageUseCase } from '../usecases/mod-delete-message.usecase'
import { ModDeleteJobUseCase } from '../usecases/mod-delete-job.usecase'
import { GetModerationLogsUseCase } from '../usecases/get-moderation-logs.usecase'

@Controller('moderation')
@UseGuards(JwtGuard, BanGuard, RolesGuard)
@Roles(UserRoleEnum.Moderator)
export class ModerationController {
  constructor(
    private readonly banUser: BanUserUseCase,
    private readonly unbanUser: UnbanUserUseCase,
    private readonly muteUser: MuteUserUseCase,
    private readonly unmuteUser: UnmuteUserUseCase,
    private readonly modDeletePost: ModDeletePostUseCase,
    private readonly modDeleteComment: ModDeleteCommentUseCase,
    private readonly modDeleteMessage: ModDeleteMessageUseCase,
    private readonly modDeleteJob: ModDeleteJobUseCase,
    private readonly getLogs: GetModerationLogsUseCase,
  ) {}

  // Ban/Unban
  @Post('users/:userId/ban')
  @UseGuards(PermissionsGuard)
  @RequirePermission('ban_users')
  @HttpCode(HttpStatus.NO_CONTENT)
  ban(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
    @Body() body: { reason: string; durationHours?: number | null; banChat?: boolean; banChallenge?: boolean; banDuel?: boolean },
  ) {
    return this.banUser.execute(userId, req.user.id, body)
  }

  @Post('users/:userId/unban')
  @UseGuards(PermissionsGuard)
  @RequirePermission('ban_users')
  @HttpCode(HttpStatus.NO_CONTENT)
  unban(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.unbanUser.execute(userId, req.user.id)
  }

  // Mute/Unmute
  @Post('users/:userId/mute')
  @UseGuards(PermissionsGuard)
  @RequirePermission('mute_users')
  @HttpCode(HttpStatus.NO_CONTENT)
  mute(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
    @Body() body: { durationHours?: number | null; muteChat?: boolean; muteGlobal?: boolean },
  ) {
    return this.muteUser.execute(userId, req.user.id, body)
  }

  @Post('users/:userId/unmute')
  @UseGuards(PermissionsGuard)
  @RequirePermission('mute_users')
  @HttpCode(HttpStatus.NO_CONTENT)
  unmute(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.unmuteUser.execute(userId, req.user.id)
  }

  // Content deletion
  @Delete('posts/:postId')
  @UseGuards(PermissionsGuard)
  @RequirePermission('delete_posts')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePost(
    @Param('postId') postId: string,
    @Request() req: { user: { id: string } },
    @Body() body: { reason?: string },
  ) {
    return this.modDeletePost.execute(postId, req.user.id, body?.reason)
  }

  @Delete('comments/:commentId')
  @UseGuards(PermissionsGuard)
  @RequirePermission('delete_posts')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteComment(
    @Param('commentId') commentId: string,
    @Request() req: { user: { id: string } },
    @Body() body: { reason?: string },
  ) {
    return this.modDeleteComment.execute(commentId, req.user.id, body?.reason)
  }

  @Delete('messages/:messageId')
  @UseGuards(PermissionsGuard)
  @RequirePermission('manage_chat')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMessage(
    @Param('messageId') messageId: string,
    @Request() req: { user: { id: string } },
    @Body() body: { reason?: string },
  ) {
    return this.modDeleteMessage.execute(messageId, req.user.id, body?.reason)
  }

  @Delete('jobs/:jobId')
  @UseGuards(PermissionsGuard)
  @RequirePermission('manage_jobs')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteJob(
    @Param('jobId') jobId: string,
    @Request() req: { user: { id: string } },
    @Body() body: { reason?: string },
  ) {
    return this.modDeleteJob.execute(jobId, req.user.id, body?.reason)
  }

  // Logs
  @Get('logs')
  @UseGuards(PermissionsGuard)
  @RequirePermission('manage_reports')
  logs(
    @Query('action') action?: string,
    @Query('moderatorId') moderatorId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.getLogs.execute({
      action,
      moderatorId,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    })
  }
}
