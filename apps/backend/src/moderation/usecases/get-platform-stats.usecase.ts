import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThan } from 'typeorm'
import { User, UserRoleEnum } from '../../entities/user.entity'
import { Post } from '../../entities/post.entity'
import { Duel } from '../../entities/duel.entity'
import { Challenge } from '../../entities/challenge.entity'
import { JobOffer } from '../../entities/job-offer.entity'
import { Report, ReportStatusEnum } from '../../entities/report.entity'
import { PlatformStats, PlatformTrends, TrendPoint } from '@amalia/shared'

@Injectable()
export class GetPlatformStatsUseCase {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Duel) private readonly duelRepo: Repository<Duel>,
    @InjectRepository(Challenge) private readonly challengeRepo: Repository<Challenge>,
    @InjectRepository(JobOffer) private readonly jobRepo: Repository<JobOffer>,
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
  ) {}

  async getStats(): Promise<PlatformStats> {
    const [totalUsers, totalPosts, totalDuels, totalChallenges, totalJobs, totalReports, pendingReports] = await Promise.all([
      this.userRepo.count(),
      this.postRepo.count(),
      this.duelRepo.count(),
      this.challengeRepo.count(),
      this.jobRepo.count(),
      this.reportRepo.count(),
      this.reportRepo.count({ where: { status: ReportStatusEnum.Pending } }),
    ])

    const now = new Date()
    const activeBans = await this.userRepo.count({
      where: { bannedUntil: MoreThan(now) },
    })

    const activeModerators = await this.userRepo.count({
      where: { role: UserRoleEnum.Moderator },
    })

    const activeAdmins = await this.userRepo.count({
      where: { role: UserRoleEnum.Admin },
    })

    return {
      totalUsers,
      totalPosts,
      totalDuels,
      totalChallenges,
      totalJobs,
      totalReports,
      pendingReports,
      activeBans,
      activeModerators,
      activeAdmins,
    }
  }

  async getTrends(): Promise<PlatformTrends> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000)

    const [newUsers, newPosts, newReports, newDuels] = await Promise.all([
      this.getDailyTrend(this.userRepo, 'user', thirtyDaysAgo),
      this.getDailyTrend(this.postRepo, 'post', thirtyDaysAgo),
      this.getDailyTrend(this.reportRepo, 'report', thirtyDaysAgo),
      this.getDailyTrend(this.duelRepo, 'duel', thirtyDaysAgo),
    ])

    return { newUsers, newPosts, newReports, newDuels }
  }

  private async getDailyTrend(repo: Repository<unknown>, alias: string, since: Date): Promise<TrendPoint[]> {
    const results = await (repo as Repository<any>)
      .createQueryBuilder(alias)
      .select(`DATE(${alias}."createdAt")`, 'date')
      .addSelect('COUNT(*)', 'count')
      .where(`${alias}."createdAt" >= :since`, { since })
      .groupBy(`DATE(${alias}."createdAt")`)
      .orderBy('date', 'ASC')
      .getRawMany()

    return results.map((r: { date: string; count: string }) => ({
      date: r.date,
      count: parseInt(r.count, 10),
    }))
  }
}
