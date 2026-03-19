import { Controller, Post, Param, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { FriendshipService } from '../friendship.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'

@Controller('friendships')
@UseGuards(JwtGuard)
export class PostAcceptRequestController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post(':id/accept')
  @HttpCode(HttpStatus.NO_CONTENT)
  accept(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<void> {
    return this.friendshipService.acceptRequest(id, req.user.id)
  }
}
