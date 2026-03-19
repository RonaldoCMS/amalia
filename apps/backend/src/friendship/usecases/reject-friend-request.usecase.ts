import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { FriendshipRepository } from '../../shared/repositories/pg/friendship.repository'
import { FriendshipStatus } from '@amalia/shared'

@Injectable()
export class RejectFriendRequestUseCase {
  constructor(private readonly friendshipRepository: FriendshipRepository) {}

  async execute(friendshipId: string, userId: string): Promise<void> {
    const friendship = await this.friendshipRepository.findById(friendshipId)
    if (!friendship) throw new NotFoundException('Richiesta non trovata')
    if (friendship.addresseeId !== userId) throw new ForbiddenException('Non puoi rifiutare questa richiesta')
    if (friendship.status !== FriendshipStatus.Pending) throw new ForbiddenException('Richiesta non più pendente')

    await this.friendshipRepository.updateStatus(friendshipId, FriendshipStatus.Rejected)
  }
}
