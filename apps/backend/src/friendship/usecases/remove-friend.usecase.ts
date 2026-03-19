import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { FriendshipRepository } from '../../shared/repositories/pg/friendship.repository'
import { FriendshipStatus } from '@amalia/shared'

@Injectable()
export class RemoveFriendUseCase {
  constructor(private readonly friendshipRepository: FriendshipRepository) {}

  async execute(friendshipId: string, userId: string): Promise<void> {
    const friendship = await this.friendshipRepository.findById(friendshipId)
    if (!friendship) throw new NotFoundException('Amicizia non trovata')
    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      throw new ForbiddenException('Non puoi rimuovere questa amicizia')
    }
    await this.friendshipRepository.delete(friendshipId)
  }
}
