import { Controller, Post, Param, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { FriendshipService } from '../friendship.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'

@Controller('friendships')
@UseGuards(JwtGuard)
export class PostRejectRequestController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post(':id/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  reject(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<void> {
    return this.friendshipService.rejectRequest(id, req.user.id)
  }
}
