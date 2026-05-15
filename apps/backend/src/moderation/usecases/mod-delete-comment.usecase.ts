import { Injectable, NotFoundException } from '@nestjs/common'
import { PostCommentRepository } from '../../shared/repositories/pg/post-comment.repository'
import { ModerationLogRepository } from '../repositories/moderation-log.repository'
import { NotificationService } from '../../notifications/notification.service'
import { ModerationActionEnum } from '../../entities/moderation-log.entity'
import { NotificationType } from '@amalia/shared'

@Injectable()
export class ModDeleteCommentUseCase {
  constructor(
    private readonly commentRepository: PostCommentRepository,
    private readonly moderationLogRepository: ModerationLogRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(commentId: string, moderatorId: string, reason?: string): Promise<void> {
    const comment = await this.commentRepository.findById(commentId)
    if (!comment) throw new NotFoundException('Comment not found')

    await this.commentRepository.delete(commentId)

    await this.moderationLogRepository.create({
      moderatorId,
      targetUserId: comment.author.id,
      action: ModerationActionEnum.DeleteComment,
      details: { commentId, reason },
    })

    await this.notificationService.notify(
      comment.author.id,
      NotificationType.CommentDeletedByMod,
      'Comment Removed',
      reason ? `Your comment was removed: ${reason}` : 'Your comment was removed by a moderator',
      commentId,
    )
  }
}
