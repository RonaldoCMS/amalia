import { Controller, Delete, Param, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { FeedService } from '../feed.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'

@Controller('feed')
@UseGuards(JwtGuard)
export class DeleteCommentController {
  constructor(private readonly feedService: FeedService) {}

  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteComment(
    @Param('commentId') commentId: string,
    @Request() req: { user: { id: string } },
  ): Promise<void> {
    return this.feedService.deleteComment(commentId, req.user.id)
  }
}
