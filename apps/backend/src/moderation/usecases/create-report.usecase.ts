import { Injectable } from '@nestjs/common'
import { ReportRepository } from '../repositories/report.repository'
import { ModerationLogRepository } from '../repositories/moderation-log.repository'
import { NotificationService } from '../../notifications/notification.service'
import { PermissionRepository } from '../repositories/permission.repository'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { ReportTargetTypeEnum, ReportReasonEnum } from '../../entities/report.entity'
import { NotificationType } from '@amalia/shared'

@Injectable()
export class CreateReportUseCase {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly moderationLogRepository: ModerationLogRepository,
    private readonly notificationService: NotificationService,
    private readonly permissionRepository: PermissionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(reporterId: string, data: {
    targetType: ReportTargetTypeEnum
    targetId: string
    reportedUserId?: string
    reason: ReportReasonEnum
    description?: string
  }): Promise<{ id: string }> {
    const report = await this.reportRepository.create({
      reporter: { id: reporterId } as any,
      reportedUser: data.reportedUserId ? { id: data.reportedUserId } as any : null,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
      description: data.description ?? null,
    })

    // Notify all users with manage_reports permission
    const moderatorIds = await this.permissionRepository.getUsersWithPermission('manage_reports')
    const reporter = await this.userRepository.findById(reporterId)
    const reporterName = reporter?.username ?? 'Unknown'

    for (const modId of moderatorIds) {
      if (modId !== reporterId) {
        await this.notificationService.notify(
          modId,
          NotificationType.ReportSubmitted,
          'New Report',
          `${reporterName} reported a ${data.targetType} for ${data.reason}`,
          report.id,
        )
      }
    }

    return { id: report.id }
  }
}
