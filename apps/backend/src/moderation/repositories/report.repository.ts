import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Report, ReportStatusEnum } from '../../entities/report.entity'

@Injectable()
export class ReportRepository {
  constructor(
    @InjectRepository(Report)
    private readonly repository: Repository<Report>,
  ) {}

  async create(data: Partial<Report>): Promise<Report> {
    const report = this.repository.create(data)
    return this.repository.save(report)
  }

  async findById(id: string): Promise<Report | null> {
    return this.repository.findOne({ where: { id } })
  }

  async findAll(options: {
    status?: ReportStatusEnum
    targetType?: string
    page: number
    limit: number
  }): Promise<{ reports: Report[]; total: number }> {
    const qb = this.repository.createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('report.reportedUser', 'reportedUser')
      .leftJoinAndSelect('report.resolvedBy', 'resolvedBy')
      .orderBy('report.createdAt', 'DESC')

    if (options.status) {
      qb.andWhere('report.status = :status', { status: options.status })
    }
    if (options.targetType) {
      qb.andWhere('report.targetType = :targetType', { targetType: options.targetType })
    }

    const total = await qb.getCount()
    const reports = await qb
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getMany()

    return { reports, total }
  }

  async updateStatus(id: string, status: ReportStatusEnum, resolvedById?: string, resolution?: string): Promise<void> {
    const update: Partial<Report> = { status }
    if (resolvedById) {
      update.resolvedBy = { id: resolvedById } as any
      update.resolvedAt = new Date()
    }
    if (resolution) {
      update.resolution = resolution
    }
    await this.repository.update(id, update)
  }

  async countByStatus(status: ReportStatusEnum): Promise<number> {
    return this.repository.count({ where: { status } })
  }
}
