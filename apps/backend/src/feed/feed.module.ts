import { Module } from '@nestjs/common'
import { FeedService } from './feed.service'
import { NotificationModule } from '../notifications/notification.module'
import { PostCreateFeedController } from './controllers/post-create-feed.controller'
import { GetFeedController } from './controllers/get-feed.controller'
import { GetUserPostsController } from './controllers/get-user-posts.controller'
import { PostToggleLikeController } from './controllers/post-toggle-like.controller'
import { DeletePostController } from './controllers/delete-post.controller'
import { GetCommentsController } from './controllers/get-comments.controller'
import { PostCreateCommentController } from './controllers/post-create-comment.controller'
import { DeleteCommentController } from './controllers/delete-comment.controller'
import { CreatePostUseCase } from './usecases/create-post.usecase'
import { GetFeedUseCase } from './usecases/get-feed.usecase'
import { GetUserPostsUseCase } from './usecases/get-user-posts.usecase'
import { ToggleLikeUseCase } from './usecases/toggle-like.usecase'
import { DeletePostUseCase } from './usecases/delete-post.usecase'
import { CreateCommentUseCase } from './usecases/create-comment.usecase'
import { GetCommentsUseCase } from './usecases/get-comments.usecase'
import { DeleteCommentUseCase } from './usecases/delete-comment.usecase'

@Module({
  imports: [NotificationModule],
  controllers: [
    PostCreateFeedController,
    GetFeedController,
    GetUserPostsController,
    PostToggleLikeController,
    DeletePostController,
    GetCommentsController,
    PostCreateCommentController,
    DeleteCommentController,
  ],
  providers: [
    FeedService,
    CreatePostUseCase,
    GetFeedUseCase,
    GetUserPostsUseCase,
    ToggleLikeUseCase,
    DeletePostUseCase,
    CreateCommentUseCase,
    GetCommentsUseCase,
    DeleteCommentUseCase,
  ],
})
export class FeedModule {}
