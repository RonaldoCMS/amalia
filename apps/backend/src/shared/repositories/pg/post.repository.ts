import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Post } from 'src/entities/post.entity'

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private readonly repository: Repository<Post>,
  ) {}

  async getFeed(page: number, limit: number): Promise<[Post[], number]> {
    return this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()
  }

  async getByUser(userId: string, page: number, limit: number): Promise<[Post[], number]> {
    return this.repository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.authorId = :userId', { userId })
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()
  }

  async findById(id: string): Promise<Post | null> {
    return this.repository.findOne({ where: { id }, relations: ['author'] })
  }

  async save(post: Partial<Post>): Promise<Post> {
    return this.repository.save(post)
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }

  async incrementLikes(id: string): Promise<void> {
    await this.repository.increment({ id }, 'likesCount', 1)
  }

  async decrementLikes(id: string): Promise<void> {
    await this.repository.decrement({ id }, 'likesCount', 1)
  }

  async incrementComments(id: string): Promise<void> {
    await this.repository.increment({ id }, 'commentsCount', 1)
  }

  async decrementComments(id: string): Promise<void> {
    await this.repository.decrement({ id }, 'commentsCount', 1)
  }
}
