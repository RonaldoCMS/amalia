import { Controller, Post, Param, Request, UseGuards } from '@nestjs/common'
import { FeedService } from '../feed.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'

@Controller('feed')
@UseGuards(JwtGuard)
export class PostToggleLikeController {
  constructor(private readonly feedService: FeedService) {}

  @Post(':postId/like')
  toggleLike(
    @Param('postId') postId: string,
    @Request() req: { user: { id: string } },
  ): Promise<{ liked: boolean }> {
    return this.feedService.toggleLike(postId, req.user.id)
  }
}
