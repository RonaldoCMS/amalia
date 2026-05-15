import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ModerationLog, ModerationActionEnum } from '../../entities/moderation-log.entity'

@Injectable()
export class ModerationLogRepository {
  constructor(
    @InjectRepository(ModerationLog)
    private readonly repository: Repository<ModerationLog>,
  ) {}

  async create(data: {
    moderatorId: string
    targetUserId?: string
    action: ModerationActionEnum
    details?: Record<string, unknown>
  }): Promise<ModerationLog> {
    const log = this.repository.create({
      moderator: { id: data.moderatorId } as any,
      targetUser: data.targetUserId ? { id: data.targetUserId } as any : null,
      action: data.action,
      details: data.details ?? null,
    })
    return this.repository.save(log)
  }

  async findAll(options: {
    action?: ModerationActionEnum
    moderatorId?: string
    page: number
    limit: number
  }): Promise<{ logs: ModerationLog[]; total: number }> {
    const qb = this.repository.createQueryBuilder('log')
      .leftJoinAndSelect('log.moderator', 'moderator')
      .leftJoinAndSelect('log.targetUser', 'targetUser')
      .orderBy('log.createdAt', 'DESC')

    if (options.action) {
      qb.andWhere('log.action = :action', { action: options.action })
    }
    if (options.moderatorId) {
      qb.andWhere('moderator.id = :moderatorId', { moderatorId: options.moderatorId })
    }

    const total = await qb.getCount()
    const logs = await qb
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getMany()

    return { logs, total }
  }
}
