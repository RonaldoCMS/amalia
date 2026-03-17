import { Injectable } from '@nestjs/common'
import { NotificationRepository } from '../shared/repositories/pg/notification.repository'
import { NotificationItem, NotificationType } from '@amelia/shared'

@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const items = await this.notificationRepository.getByUser(userId)
    return items.map(n => ({
      id: n.id,
      type: n.type as NotificationType,
      title: n.title,
      body: n.body,
      referenceId: n.referenceId,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }))
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.getUnreadCount(userId)
    return { count }
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllRead(userId)
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.notificationRepository.markRead(id, userId)
  }

  /** Chiamata internamente da altri servizi */
  async notify(userId: string, type: NotificationType, title: string, body: string, referenceId?: string): Promise<void> {
    await this.notificationRepository.create(userId, type, title, body, referenceId)
  }
}
