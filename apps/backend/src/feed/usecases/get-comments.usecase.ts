import { Injectable } from '@nestjs/common'
import { PostCommentRepository } from '../../shared/repositories/pg/post-comment.repository'
import { CommentItem } from '@amalia/shared'

@Injectable()
export class GetCommentsUseCase {
  constructor(private readonly postCommentRepository: PostCommentRepository) {}

  async execute(postId: string): Promise<CommentItem[]> {
    const comments = await this.postCommentRepository.getByPost(postId)
    return comments.map(c => ({
      id: c.id,
      authorId: c.author.id,
      authorUsername: c.author.username,
      authorProfilePhotoUrl: c.author.profilePhotoUrl,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
    }))
  }
}
