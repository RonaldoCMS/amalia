import { Controller, Delete, Param, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { FeedService } from '../feed.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'

@Controller('feed')
@UseGuards(JwtGuard)
export class DeletePostController {
  constructor(private readonly feedService: FeedService) {}

  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePost(
    @Param('postId') postId: string,
    @Request() req: { user: { id: string } },
  ): Promise<void> {
    return this.feedService.deletePost(postId, req.user.id)
  }
}
