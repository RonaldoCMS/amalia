import { Module } from '@nestjs/common'
import { FriendshipService } from './friendship.service'
import { NotificationModule } from '../notifications/notification.module'
import { PostSendRequestController } from './controllers/post-send-request.controller'
import { PostAcceptRequestController } from './controllers/post-accept-request.controller'
import { PostRejectRequestController } from './controllers/post-reject-request.controller'
import { GetFriendsController } from './controllers/get-friends.controller'
import { GetPendingRequestsController } from './controllers/get-pending-requests.controller'
import { GetFriendshipStatusController } from './controllers/get-friendship-status.controller'
import { DeleteFriendController } from './controllers/delete-friend.controller'
import { SendFriendRequestUseCase } from './usecases/send-friend-request.usecase'
import { AcceptFriendRequestUseCase } from './usecases/accept-friend-request.usecase'
import { RejectFriendRequestUseCase } from './usecases/reject-friend-request.usecase'
import { GetFriendsUseCase } from './usecases/get-friends.usecase'
import { GetPendingRequestsUseCase } from './usecases/get-pending-requests.usecase'
import { GetFriendshipStatusUseCase } from './usecases/get-friendship-status.usecase'
import { RemoveFriendUseCase } from './usecases/remove-friend.usecase'

@Module({
  imports: [NotificationModule],
  controllers: [
    PostSendRequestController,
    PostAcceptRequestController,
    PostRejectRequestController,
    GetFriendsController,
    GetPendingRequestsController,
    GetFriendshipStatusController,
    DeleteFriendController,
  ],
  providers: [
    FriendshipService,
    SendFriendRequestUseCase,
    AcceptFriendRequestUseCase,
    RejectFriendRequestUseCase,
    GetFriendsUseCase,
    GetPendingRequestsUseCase,
    GetFriendshipStatusUseCase,
    RemoveFriendUseCase,
  ],
})
export class FriendshipModule {}
