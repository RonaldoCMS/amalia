import { Injectable, NotFoundException } from '@nestjs/common'
import { ReportRepository } from '../repositories/report.repository'
import { ModerationLogRepository } from '../repositories/moderation-log.repository'
import { ReportStatusEnum } from '../../entities/report.entity'
import { ModerationActionEnum } from '../../entities/moderation-log.entity'

@Injectable()
export class DismissReportUseCase {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly moderationLogRepository: ModerationLogRepository,
  ) {}

  async execute(reportId: string, moderatorId: string, resolution?: string): Promise<void> {
    const report = await this.reportRepository.findById(reportId)
    if (!report) throw new NotFoundException('Report not found')

    await this.reportRepository.updateStatus(reportId, ReportStatusEnum.Dismissed, moderatorId, resolution ?? 'Dismissed')

    await this.moderationLogRepository.create({
      moderatorId,
      targetUserId: report.reportedUser?.id,
      action: ModerationActionEnum.DismissReport,
      details: { reportId, resolution, targetType: report.targetType, reason: report.reason },
    })
  }
}
