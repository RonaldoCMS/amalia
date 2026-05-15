import { Injectable } from '@nestjs/common'
import { ModerationLogRepository } from '../repositories/moderation-log.repository'
import { ModerationActionEnum } from '../../entities/moderation-log.entity'
import { ModerationLogListResponse } from '@amalia/shared'

@Injectable()
export class GetModerationLogsUseCase {
  constructor(private readonly logRepository: ModerationLogRepository) {}

  async execute(options: {
    action?: string
    moderatorId?: string
    page?: number
    limit?: number
  }): Promise<ModerationLogListResponse> {
    const page = options.page ?? 1
    const limit = options.limit ?? 20

    const { logs, total } = await this.logRepository.findAll({
      action: options.action as ModerationActionEnum | undefined,
      moderatorId: options.moderatorId,
      page,
      limit,
    })

    return {
      logs: logs.map(l => ({
        id: l.id,
        moderator: { id: l.moderator.id, username: l.moderator.username },
        targetUser: l.targetUser ? { id: l.targetUser.id, username: l.targetUser.username } : null,
        action: l.action as any,
        details: l.details,
        createdAt: l.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    }
  }
}
