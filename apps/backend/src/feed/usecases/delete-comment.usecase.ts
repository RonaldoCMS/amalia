import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PostCommentRepository } from '../../shared/repositories/pg/post-comment.repository'
import { PostRepository } from '../../shared/repositories/pg/post.repository'

@Injectable()
export class DeleteCommentUseCase {
  constructor(
    private readonly postCommentRepository: PostCommentRepository,
    private readonly postRepository: PostRepository,
  ) {}

  async execute(commentId: string, userId: string): Promise<void> {
    const comment = await this.postCommentRepository.findById(commentId)
    if (!comment) throw new NotFoundException('Commento non trovato')
    if (comment.author.id !== userId) throw new ForbiddenException('Non puoi eliminare questo commento')
    await this.postCommentRepository.delete(commentId)
    await this.postRepository.decrementComments(comment.postId)
  }
}
