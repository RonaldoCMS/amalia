import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { FriendshipService } from '../friendship.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { FriendshipItem } from '@amalia/shared'

@Controller('friendships')
@UseGuards(JwtGuard)
export class GetPendingRequestsController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Get('pending')
  getPending(@Request() req: { user: { id: string } }): Promise<FriendshipItem[]> {
    return this.friendshipService.getPendingRequests(req.user.id)
  }
}
