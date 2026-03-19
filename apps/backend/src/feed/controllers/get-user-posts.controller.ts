import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common'
import { FeedService } from '../feed.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { FeedResponse } from '@amalia/shared'

@Controller('feed')
@UseGuards(JwtGuard)
export class GetUserPostsController {
  constructor(private readonly feedService: FeedService) {}

  @Get('user/:userId')
  getUserPosts(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Request() req: { user: { id: string } },
  ): Promise<FeedResponse> {
    return this.feedService.getUserPosts(userId, req.user.id, parseInt(page) || 1, Math.min(parseInt(limit) || 20, 50))
  }
}
