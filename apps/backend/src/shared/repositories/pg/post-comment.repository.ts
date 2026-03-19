import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PostComment } from 'src/entities/post-comment.entity'

@Injectable()
export class PostCommentRepository {
  constructor(
    @InjectRepository(PostComment)
    private readonly repository: Repository<PostComment>,
  ) {}

  async getByPost(postId: string): Promise<PostComment[]> {
    return this.repository.find({
      where: { postId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    })
  }

  async findById(id: string): Promise<PostComment | null> {
    return this.repository.findOne({ where: { id }, relations: ['author'] })
  }

  async save(postId: string, authorId: string, content: string): Promise<PostComment> {
    return this.repository.save({
      post: { id: postId } as any,
      postId,
      author: { id: authorId } as any,
      authorId,
      content,
    })
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}
