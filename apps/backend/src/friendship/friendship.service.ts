import { Injectable } from '@nestjs/common'
import { SendFriendRequestUseCase } from './usecases/send-friend-request.usecase'
import { AcceptFriendRequestUseCase } from './usecases/accept-friend-request.usecase'
import { RejectFriendRequestUseCase } from './usecases/reject-friend-request.usecase'
import { GetFriendsUseCase } from './usecases/get-friends.usecase'
import { GetPendingRequestsUseCase } from './usecases/get-pending-requests.usecase'
import { GetFriendshipStatusUseCase } from './usecases/get-friendship-status.usecase'
import { RemoveFriendUseCase } from './usecases/remove-friend.usecase'
import { FriendshipItem, FriendshipStatusResponse } from '@amalia/shared'

@Injectable()
export class FriendshipService {
  constructor(
    private readonly sendFriendRequestUseCase: SendFriendRequestUseCase,
    private readonly acceptFriendRequestUseCase: AcceptFriendRequestUseCase,
    private readonly rejectFriendRequestUseCase: RejectFriendRequestUseCase,
    private readonly getFriendsUseCase: GetFriendsUseCase,
    private readonly getPendingRequestsUseCase: GetPendingRequestsUseCase,
    private readonly getFriendshipStatusUseCase: GetFriendshipStatusUseCase,
    private readonly removeFriendUseCase: RemoveFriendUseCase,
  ) {}

  sendRequest(requesterId: string, addresseeId: string): Promise<{ id: string }> {
    return this.sendFriendRequestUseCase.execute(requesterId, addresseeId)
  }

  acceptRequest(friendshipId: string, userId: string): Promise<void> {
    return this.acceptFriendRequestUseCase.execute(friendshipId, userId)
  }

  rejectRequest(friendshipId: string, userId: string): Promise<void> {
    return this.rejectFriendRequestUseCase.execute(friendshipId, userId)
  }

  getFriends(userId: string): Promise<FriendshipItem[]> {
    return this.getFriendsUseCase.execute(userId)
  }

  getPendingRequests(userId: string): Promise<FriendshipItem[]> {
    return this.getPendingRequestsUseCase.execute(userId)
  }

  getStatus(userId: string, targetUserId: string): Promise<FriendshipStatusResponse> {
    return this.getFriendshipStatusUseCase.execute(userId, targetUserId)
  }

  removeFriend(friendshipId: string, userId: string): Promise<void> {
    return this.removeFriendUseCase.execute(friendshipId, userId)
  }
}
