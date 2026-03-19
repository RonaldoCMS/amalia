import { Injectable } from '@nestjs/common'
import { PostRepository } from '../../shared/repositories/pg/post.repository'
import { PostItem } from '@amalia/shared'

@Injectable()
export class CreatePostUseCase {
  constructor(private readonly postRepository: PostRepository) {}

  async execute(userId: string, content: string, imageUrl: string | null): Promise<PostItem> {
    const post = await this.postRepository.save({
      authorId: userId,
      author: { id: userId } as any,
      content,
      imageUrl,
    })

    const saved = await this.postRepository.findById(post.id)

    return {
      id: saved!.id,
      authorId: saved!.author.id,
      authorUsername: saved!.author.username,
      authorProfilePhotoUrl: saved!.author.profilePhotoUrl,
      content: saved!.content,
      imageUrl: saved!.imageUrl,
      likesCount: 0,
      commentsCount: 0,
      likedByMe: false,
      createdAt: saved!.createdAt.toISOString(),
    }
  }
}
