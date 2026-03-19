import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { FeedService } from '../feed.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { CommentItem } from '@amalia/shared'

@Controller('feed')
@UseGuards(JwtGuard)
export class GetCommentsController {
  constructor(private readonly feedService: FeedService) {}

  @Get(':postId/comments')
  getComments(@Param('postId') postId: string): Promise<CommentItem[]> {
    return this.feedService.getComments(postId)
  }
}
