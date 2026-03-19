import { Injectable } from '@nestjs/common'
import { FriendshipRepository } from '../../shared/repositories/pg/friendship.repository'
import { FriendshipItem, FriendshipStatus } from '@amalia/shared'

@Injectable()
export class GetPendingRequestsUseCase {
  constructor(private readonly friendshipRepository: FriendshipRepository) {}

  async execute(userId: string): Promise<FriendshipItem[]> {
    const friendships = await this.friendshipRepository.findPendingForUser(userId)
    return friendships.map(f => ({
      id: f.id,
      status: FriendshipStatus.Pending,
      userId: f.requester.id,
      username: f.requester.username,
      profilePhotoUrl: f.requester.profilePhotoUrl,
      createdAt: f.createdAt.toISOString(),
    }))
  }
}
