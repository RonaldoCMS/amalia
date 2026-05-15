import { Injectable, NotFoundException } from '@nestjs/common'
import { ReportRepository } from '../repositories/report.repository'
import { ModerationLogRepository } from '../repositories/moderation-log.repository'
import { NotificationService } from '../../notifications/notification.service'
import { ReportStatusEnum } from '../../entities/report.entity'
import { ModerationActionEnum } from '../../entities/moderation-log.entity'
import { NotificationType } from '@amalia/shared'

@Injectable()
export class ResolveReportUseCase {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly moderationLogRepository: ModerationLogRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(reportId: string, moderatorId: string, resolution: string): Promise<void> {
    const report = await this.reportRepository.findById(reportId)
    if (!report) throw new NotFoundException('Report not found')

    await this.reportRepository.updateStatus(reportId, ReportStatusEnum.Resolved, moderatorId, resolution)

    await this.moderationLogRepository.create({
      moderatorId,
      targetUserId: report.reportedUser?.id,
      action: ModerationActionEnum.ResolveReport,
      details: { reportId, resolution, targetType: report.targetType, reason: report.reason },
    })

    // Notify reporter
    await this.notificationService.notify(
      report.reporter.id,
      NotificationType.ReportResolved,
      'Report Resolved',
      `Your report has been reviewed and resolved`,
      reportId,
    )
  }
}
