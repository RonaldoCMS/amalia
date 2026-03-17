import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Notification } from 'src/entities/notification.entity'

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
  ) {}

  async create(userId: string, type: string, title: string, body: string, referenceId?: string): Promise<Notification> {
    const n = this.repository.create({
      user: { id: userId } as any,
      type,
      title,
      body,
      referenceId: referenceId ?? null,
    })
    return this.repository.save(n)
  }

  async getByUser(userId: string, limit = 30): Promise<Notification[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: limit,
    })
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repository.count({
      where: { user: { id: userId }, read: false },
    })
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true })
      .where('"userId" = :userId AND read = false', { userId })
      .execute()
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true })
      .where('id = :id AND "userId" = :userId', { id, userId })
      .execute()
  }
}
