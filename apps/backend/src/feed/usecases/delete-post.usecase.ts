import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PostRepository } from '../../shared/repositories/pg/post.repository'

@Injectable()
export class DeletePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(postId)
    if (!post) throw new NotFoundException('Post non trovato')
    if (post.author.id !== userId) throw new ForbiddenException('Non puoi eliminare questo post')
    await this.postRepository.delete(postId)
  }
}
