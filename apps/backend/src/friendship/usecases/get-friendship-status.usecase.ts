import { Injectable } from '@nestjs/common'
import { FriendshipRepository } from '../../shared/repositories/pg/friendship.repository'
import { FriendshipStatusResponse } from '@amalia/shared'

@Injectable()
export class GetFriendshipStatusUseCase {
  constructor(private readonly friendshipRepository: FriendshipRepository) {}

  async execute(userId: string, targetUserId: string): Promise<FriendshipStatusResponse> {
    const friendship = await this.friendshipRepository.findByUsers(userId, targetUserId)
    if (!friendship) return { status: null, friendshipId: null, direction: null }

    return {
      status: friendship.status,
      friendshipId: friendship.id,
      direction: friendship.requesterId === userId ? 'sent' : 'received',
    }
  }
}
