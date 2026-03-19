import { Injectable } from '@nestjs/common'
import { FriendshipRepository } from '../../shared/repositories/pg/friendship.repository'
import { FriendshipItem } from '@amalia/shared'

@Injectable()
export class GetFriendsUseCase {
  constructor(private readonly friendshipRepository: FriendshipRepository) {}

  async execute(userId: string): Promise<FriendshipItem[]> {
    const friendships = await this.friendshipRepository.findFriendsOfUser(userId)
    return friendships.map(f => {
      const friend = f.requesterId === userId ? f.addressee : f.requester
      return {
        id: f.id,
        status: f.status,
        userId: friend.id,
        username: friend.username,
        profilePhotoUrl: friend.profilePhotoUrl,
        createdAt: f.createdAt.toISOString(),
      }
    })
  }
}
