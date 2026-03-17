import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { ChatMessageRepository } from '../shared/repositories/pg/chat-message.repository'
import { DevMatchRepository } from '../shared/repositories/pg/dev-match.repository'
import { NotificationService } from '../notifications/notification.service'
import { ChatMessageItem, SendMessageRequest, NotificationType } from '@amelia/shared'

@Injectable()
export class ChatService {
  constructor(
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly devMatchRepository: DevMatchRepository,
    private readonly notificationService: NotificationService,
  ) {}

  private async assertMember(matchId: string, userId: string): Promise<void> {
    const match = await this.devMatchRepository.findById(matchId)
    if (!match) throw new NotFoundException('Match non trovato')
    if (!match.matchedAt) throw new ForbiddenException('Non ancora in match')
    if (match.user1.id !== userId && match.user2.id !== userId) {
      throw new ForbiddenException('Non sei parte di questo match')
    }
  }

  private toItem(m: any): ChatMessageItem {
    return {
      id: m.id,
      senderId: m.sender?.id ?? '',
      content: m.content ?? '',
      imageUrl: m.imageUrl ?? null,
      replyToId: m.replyToId ?? null,
      isSystemMessage: m.isSystemMessage ?? false,
      duelInviteId: m.duelInviteId ?? null,
      createdAt: m.createdAt.toISOString(),
      read: m.read,
    }
  }

  async getMessages(matchId: string, userId: string): Promise<ChatMessageItem[]> {
    await this.assertMember(matchId, userId)
    const messages = await this.chatMessageRepository.getMessages(matchId)
    await this.chatMessageRepository.markRead(matchId, userId)
    return messages.map(m => this.toItem(m))
  }

  async sendMessage(matchId: string, userId: string, request: SendMessageRequest): Promise<ChatMessageItem> {
    await this.assertMember(matchId, userId)

    // Block if user archived this match
    const archived = await this.devMatchRepository.isArchivedFor(matchId, userId)
    if (archived) throw new ForbiddenException('Match rimosso')

    const msg = await this.chatMessageRepository.send(matchId, userId, request.content ?? null, {
      replyToId: request.replyToId ?? null,
    })

    // Notify partner
    const match = await this.devMatchRepository.findById(matchId)
    if (match) {
      const partnerId = match.user1.id === userId ? match.user2.id : match.user1.id
      const senderName = match.user1.id === userId ? match.user1.username : match.user2.username
      const preview = (request.content ?? '📎 Immagine').slice(0, 50)
      await this.notificationService.notify(partnerId, NotificationType.NewMessage, `Messaggio da ${senderName}`, preview, matchId)
    }

    return this.toItem(msg)
  }

  async sendImage(matchId: string, userId: string, imageUrl: string): Promise<ChatMessageItem> {
    await this.assertMember(matchId, userId)
    const archived = await this.devMatchRepository.isArchivedFor(matchId, userId)
    if (archived) throw new ForbiddenException('Match rimosso')

    const msg = await this.chatMessageRepository.send(matchId, userId, null, { imageUrl })

    const match = await this.devMatchRepository.findById(matchId)
    if (match) {
      const partnerId = match.user1.id === userId ? match.user2.id : match.user1.id
      const senderName = match.user1.id === userId ? match.user1.username : match.user2.username
      await this.notificationService.notify(partnerId, NotificationType.NewMessage, `Messaggio da ${senderName}`, '📷 Immagine', matchId)
    }

    return this.toItem(msg)
  }

  async sendSystemMessage(matchId: string, content: string, duelInviteId?: string, senderId?: string): Promise<ChatMessageItem> {
    const match = await this.devMatchRepository.findById(matchId)
    if (!match) throw new NotFoundException('Match non trovato')
    const actualSenderId = senderId ?? match.user1.id
    const msg = await this.chatMessageRepository.send(matchId, actualSenderId, content, {
      isSystemMessage: true,
      duelInviteId: duelInviteId ?? null,
    })
    return this.toItem(msg)
  }
}
