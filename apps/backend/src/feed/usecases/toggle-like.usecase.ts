import { Injectable } from '@nestjs/common'
import { PostRepository } from '../../shared/repositories/pg/post.repository'
import { PostLikeRepository } from '../../shared/repositories/pg/post-like.repository'
import { NotificationService } from '../../notifications/notification.service'
import { NotificationType } from '@amalia/shared'

@Injectable()
export class ToggleLikeUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly postLikeRepository: PostLikeRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(postId: string, userId: string): Promise<{ liked: boolean }> {
    const existing = await this.postLikeRepository.findByPostAndUser(postId, userId)

    if (existing) {
      await this.postLikeRepository.delete(existing.id)
      await this.postRepository.decrementLikes(postId)
      return { liked: false }
    }

    await this.postLikeRepository.save(postId, userId)
    await this.postRepository.incrementLikes(postId)

    // Notify post author
    const post = await this.postRepository.findById(postId)
    if (post && post.author.id !== userId) {
      await this.notificationService.notify(
        post.author.id,
        NotificationType.NewPostLike,
        'Nuovo like',
        `A qualcuno piace il tuo post`,
        postId,
      )
    }

    return { liked: true }
  }
}
