import { Injectable } from '@nestjs/common'
import { CreatePostUseCase } from './usecases/create-post.usecase'
import { GetFeedUseCase } from './usecases/get-feed.usecase'
import { GetUserPostsUseCase } from './usecases/get-user-posts.usecase'
import { ToggleLikeUseCase } from './usecases/toggle-like.usecase'
import { DeletePostUseCase } from './usecases/delete-post.usecase'
import { CreateCommentUseCase } from './usecases/create-comment.usecase'
import { GetCommentsUseCase } from './usecases/get-comments.usecase'
import { DeleteCommentUseCase } from './usecases/delete-comment.usecase'
import { PostItem, FeedResponse, CommentItem } from '@amalia/shared'

@Injectable()
export class FeedService {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly getFeedUseCase: GetFeedUseCase,
    private readonly getUserPostsUseCase: GetUserPostsUseCase,
    private readonly toggleLikeUseCase: ToggleLikeUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly getCommentsUseCase: GetCommentsUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
  ) {}

  createPost(userId: string, content: string, imageUrl: string | null): Promise<PostItem> {
    return this.createPostUseCase.execute(userId, content, imageUrl)
  }

  getFeed(userId: string, page: number, limit: number): Promise<FeedResponse> {
    return this.getFeedUseCase.execute(userId, page, limit)
  }

  getUserPosts(targetUserId: string, currentUserId: string, page: number, limit: number): Promise<FeedResponse> {
    return this.getUserPostsUseCase.execute(targetUserId, currentUserId, page, limit)
  }

  toggleLike(postId: string, userId: string): Promise<{ liked: boolean }> {
    return this.toggleLikeUseCase.execute(postId, userId)
  }

  deletePost(postId: string, userId: string): Promise<void> {
    return this.deletePostUseCase.execute(postId, userId)
  }

  createComment(postId: string, userId: string, content: string): Promise<CommentItem> {
    return this.createCommentUseCase.execute(postId, userId, content)
  }

  getComments(postId: string): Promise<CommentItem[]> {
    return this.getCommentsUseCase.execute(postId)
  }

  deleteComment(commentId: string, userId: string): Promise<void> {
    return this.deleteCommentUseCase.execute(commentId, userId)
  }
}
