import { Controller, Post, Param, Body, Request, UseGuards } from '@nestjs/common'
import { FeedService } from '../feed.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { CommentItem, CreateCommentRequest } from '@amalia/shared'

@Controller('feed')
@UseGuards(JwtGuard)
export class PostCreateCommentController {
  constructor(private readonly feedService: FeedService) {}

  @Post(':postId/comments')
  createComment(
    @Param('postId') postId: string,
    @Body() body: CreateCommentRequest,
    @Request() req: { user: { id: string } },
  ): Promise<CommentItem> {
    return this.feedService.createComment(postId, req.user.id, body.content)
  }
}
