import { Injectable } from '@nestjs/common'
import { ReportRepository } from '../repositories/report.repository'
import { ReportStatusEnum } from '../../entities/report.entity'
import { ReportItem, ReportListResponse } from '@amalia/shared'
import { Report } from '../../entities/report.entity'

@Injectable()
export class GetReportsUseCase {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(options: {
    status?: string
    targetType?: string
    page?: number
    limit?: number
  }): Promise<ReportListResponse> {
    const page = options.page ?? 1
    const limit = options.limit ?? 20

    const { reports, total } = await this.reportRepository.findAll({
      status: options.status as ReportStatusEnum | undefined,
      targetType: options.targetType,
      page,
      limit,
    })

    return {
      reports: reports.map(r => this.mapReport(r)),
      total,
      page,
      limit,
    }
  }

  private mapReport(r: Report): ReportItem {
    return {
      id: r.id,
      reporter: {
        id: r.reporter.id,
        username: r.reporter.username,
        profilePhotoUrl: r.reporter.profilePhotoUrl,
      },
      reportedUser: r.reportedUser ? {
        id: r.reportedUser.id,
        username: r.reportedUser.username,
        profilePhotoUrl: r.reportedUser.profilePhotoUrl,
      } : null,
      targetType: r.targetType as any,
      targetId: r.targetId,
      reason: r.reason as any,
      description: r.description,
      status: r.status as any,
      resolvedBy: r.resolvedBy ? { id: r.resolvedBy.id, username: r.resolvedBy.username } : null,
      resolution: r.resolution,
      createdAt: r.createdAt.toISOString(),
      resolvedAt: r.resolvedAt?.toISOString() ?? null,
    }
  }
}
