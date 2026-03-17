import { NotificationRepository } from '../repositories/notification.repository'
import { NotificationItem, UnreadCountResponse } from '@amalia/shared'

export class NotificationService {
  private readonly repo = new NotificationRepository()

  async getAll(): Promise<NotificationItem[]> {
    return this.repo.getAll()
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    return this.repo.getUnreadCount()
  }

  async markAllRead(): Promise<void> {
    return this.repo.markAllRead()
  }

  async markRead(id: string): Promise<void> {
    return this.repo.markRead(id)
  }
}
