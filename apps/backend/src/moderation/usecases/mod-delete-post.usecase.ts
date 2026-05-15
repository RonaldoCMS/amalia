import { Injectable, NotFoundException } from '@nestjs/common'
import { PostRepository } from '../../shared/repositories/pg/post.repository'
import { ModerationLogRepository } from '../repositories/moderation-log.repository'
import { NotificationService } from '../../notifications/notification.service'
import { FirebaseStorageService } from '../../shared/firebase/firebase-storage.service'
import { ModerationActionEnum } from '../../entities/moderation-log.entity'
import { NotificationType } from '@amalia/shared'

@Injectable()
export class ModDeletePostUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly moderationLogRepository: ModerationLogRepository,
    private readonly notificationService: NotificationService,
    private readonly firebaseStorage: FirebaseStorageService,
  ) {}

  async execute(postId: string, moderatorId: string, reason?: string): Promise<void> {
    const post = await this.postRepository.findById(postId)
    if (!post) throw new NotFoundException('Post not found')

    if (post.imageUrl) {
      await this.firebaseStorage.deleteFile(post.imageUrl)
    }

    await this.postRepository.delete(postId)

    await this.moderationLogRepository.create({
      moderatorId,
      targetUserId: post.author.id,
      action: ModerationActionEnum.DeletePost,
      details: { postId, reason },
    })

    await this.notificationService.notify(
      post.author.id,
      NotificationType.PostDeletedByMod,
      'Post Removed',
      reason ? `Your post was removed: ${reason}` : 'Your post was removed by a moderator',
      postId,
    )
  }
}
