import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common'
import { FeedService } from '../feed.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { FeedResponse } from '@amalia/shared'

@Controller('feed')
@UseGuards(JwtGuard)
export class GetFeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  getFeed(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Request() req: { user: { id: string } },
  ): Promise<FeedResponse> {
    return this.feedService.getFeed(req.user.id, parseInt(page) || 1, Math.min(parseInt(limit) || 20, 50))
  }
}
