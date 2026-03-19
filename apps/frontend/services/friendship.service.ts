import { FriendshipRepository } from '../repositories/friendship.repository'
import { FriendshipItem, FriendshipStatusResponse } from '@amalia/shared'

export class FriendshipService {
  private readonly repository: FriendshipRepository

  constructor() {
    this.repository = new FriendshipRepository()
  }

  sendRequest(userId: string): Promise<{ id: string }> {
    return this.repository.sendRequest(userId)
  }

  acceptRequest(friendshipId: string): Promise<void> {
    return this.repository.acceptRequest(friendshipId)
  }

  rejectRequest(friendshipId: string): Promise<void> {
    return this.repository.rejectRequest(friendshipId)
  }

  getFriends(): Promise<FriendshipItem[]> {
    return this.repository.getFriends()
  }

  getPendingRequests(): Promise<FriendshipItem[]> {
    return this.repository.getPendingRequests()
  }

  getStatus(userId: string): Promise<FriendshipStatusResponse> {
    return this.repository.getStatus(userId)
  }

  removeFriend(friendshipId: string): Promise<void> {
    return this.repository.removeFriend(friendshipId)
  }
}
