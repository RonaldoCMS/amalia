import { Controller, Post, Param, Request, UseGuards } from '@nestjs/common'
import { FriendshipService } from '../friendship.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'

@Controller('friendships')
@UseGuards(JwtGuard)
export class PostSendRequestController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('request/:userId')
  sendRequest(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
  ): Promise<{ id: string }> {
    return this.friendshipService.sendRequest(req.user.id, userId)
  }
}
