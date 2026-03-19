import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PostLike } from 'src/entities/post-like.entity'

@Injectable()
export class PostLikeRepository {
  constructor(
    @InjectRepository(PostLike)
    private readonly repository: Repository<PostLike>,
  ) {}

  async findByPostAndUser(postId: string, userId: string): Promise<PostLike | null> {
    return this.repository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    })
  }

  async save(postId: string, userId: string): Promise<PostLike> {
    return this.repository.save({
      post: { id: postId } as any,
      user: { id: userId } as any,
    })
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }

  async getLikedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
    if (postIds.length === 0) return new Set()
    const likes = await this.repository
      .createQueryBuilder('pl')
      .select('pl.postId', 'postId')
      .where('pl.userId = :userId', { userId })
      .andWhere('pl.postId IN (:...postIds)', { postIds })
      .getRawMany<{ postId: string }>()
    return new Set(likes.map(l => l.postId))
  }
}
