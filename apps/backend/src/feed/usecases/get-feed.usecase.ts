import { Injectable } from '@nestjs/common'
import { PostRepository } from '../../shared/repositories/pg/post.repository'
import { PostLikeRepository } from '../../shared/repositories/pg/post-like.repository'
import { FeedResponse } from '@amalia/shared'

@Injectable()
export class GetFeedUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postLikeRepository: PostLikeRepository,
  ) {}

  async execute(userId: string, page: number, limit: number): Promise<FeedResponse> {
    const [posts, total] = await this.postRepository.getFeed(page, limit)

    const postIds = posts.map(p => p.id)
    const likedSet = await this.postLikeRepository.getLikedPostIds(userId, postIds)

    return {
      posts: posts.map(p => ({
        id: p.id,
        authorId: p.author.id,
        authorUsername: p.author.username,
        authorProfilePhotoUrl: p.author.profilePhotoUrl,
        authorRole: p.author.role,
        content: p.content,
        imageUrl: p.imageUrl,
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
        likedByMe: likedSet.has(p.id),
        createdAt: p.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    }
  }
}
