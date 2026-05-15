import { Injectable, NotFoundException } from '@nestjs/common'
import { ChatMessageRepository } from '../../shared/repositories/pg/chat-message.repository'
import { ModerationLogRepository } from '../repositories/moderation-log.repository'
import { NotificationService } from '../../notifications/notification.service'
import { ModerationActionEnum } from '../../entities/moderation-log.entity'
import { NotificationType } from '@amalia/shared'

@Injectable()
export class ModDeleteMessageUseCase {
  constructor(
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly moderationLogRepository: ModerationLogRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(messageId: string, moderatorId: string, reason?: string): Promise<void> {
    const message = await this.chatMessageRepository.findById(messageId)
    if (!message) throw new NotFoundException('Message not found')

    await this.chatMessageRepository.deleteById(messageId)

    await this.moderationLogRepository.create({
      moderatorId,
      targetUserId: message.sender.id,
      action: ModerationActionEnum.DeleteMessage,
      details: { messageId, reason },
    })

    await this.notificationService.notify(
      message.sender.id,
      NotificationType.MessageDeletedByMod,
      'Message Removed',
      reason ? `Your message was removed: ${reason}` : 'Your message was removed by a moderator',
      messageId,
    )
  }
}
