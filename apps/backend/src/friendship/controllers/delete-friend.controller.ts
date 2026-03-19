import { Controller, Delete, Param, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { FriendshipService } from '../friendship.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'

@Controller('friendships')
@UseGuards(JwtGuard)
export class DeleteFriendController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<void> {
    return this.friendshipService.removeFriend(id, req.user.id)
  }
}
