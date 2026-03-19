import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common'
import { FriendshipService } from '../friendship.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { FriendshipStatusResponse } from '@amalia/shared'

@Controller('friendships')
@UseGuards(JwtGuard)
export class GetFriendshipStatusController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Get('status/:userId')
  getStatus(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
  ): Promise<FriendshipStatusResponse> {
    return this.friendshipService.getStatus(req.user.id, userId)
  }
}
