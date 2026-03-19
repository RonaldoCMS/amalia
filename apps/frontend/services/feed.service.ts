import { FeedRepository } from '../repositories/feed.repository'
import { PostItem, FeedResponse, CommentItem } from '@amalia/shared'

export class FeedService {
  private readonly repository: FeedRepository

  constructor() {
    this.repository = new FeedRepository()
  }

  getFeed(page?: number, limit?: number): Promise<FeedResponse> {
    return this.repository.getFeed(page, limit)
  }

  getUserPosts(userId: string, page?: number, limit?: number): Promise<FeedResponse> {
    return this.repository.getUserPosts(userId, page, limit)
  }

  createPost(content: string, image?: File): Promise<PostItem> {
    return this.repository.createPost(content, image)
  }

  toggleLike(postId: string): Promise<{ liked: boolean }> {
    return this.repository.toggleLike(postId)
  }

  deletePost(postId: string): Promise<void> {
    return this.repository.deletePost(postId)
  }

  getComments(postId: string): Promise<CommentItem[]> {
    return this.repository.getComments(postId)
  }

  createComment(postId: string, content: string): Promise<CommentItem> {
    return this.repository.createComment(postId, content)
  }

  deleteComment(commentId: string): Promise<void> {
    return this.repository.deleteComment(commentId)
  }
}
