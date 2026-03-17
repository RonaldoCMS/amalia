import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Duel } from 'src/entities/duel.entity'
import { DuelLeaderboardEntry } from '@amalia/shared'

@Injectable()
export class DuelRepository {
  constructor(
    @InjectRepository(Duel)
    private readonly repo: Repository<Duel>,
  ) {}

  async save(duel: Partial<Duel>): Promise<Duel> {
    return this.repo.save(duel)
  }

  async findById(id: string): Promise<Duel | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['user1', 'user2', 'rounds', 'rounds.challenge'],
      order: { rounds: { roundNumber: 'ASC' } },
    })
  }

  async findWaiting(excludeUserId: string, language?: string): Promise<Duel | null> {
    const qb = this.repo
      .createQueryBuilder('d')
      .where('d.status = :status', { status: 'waiting' })
      .andWhere('d."user1Id" != :uid', { uid: excludeUserId })
      .andWhere("d.\"createdAt\" > NOW() - INTERVAL '120 seconds'")
      .andWhere('d."invitedUserId" IS NULL') // exclude direct invites

    if (language) {
      // prefer same language first, then any
      qb.andWhere('(d.language = :lang OR d.language IS NULL)', { lang: language })
        .addOrderBy(`CASE WHEN d.language = :lang THEN 0 ELSE 1 END`, 'ASC')
    }

    qb.addOrderBy('d."createdAt"', 'ASC')
    return qb.getOne()
  }

  async findActiveByUser(userId: string): Promise<Duel | null> {
    return this.repo
      .createQueryBuilder('d')
      .where('d.status IN (:...statuses)', { statuses: ['waiting', 'active'] })
      .andWhere('(d."user1Id" = :uid OR d."user2Id" = :uid)', { uid: userId })
      .orderBy('d."createdAt"', 'DESC')
      .getOne()
  }

  async cancelWaiting(userId: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(Duel)
      .set({ status: 'cancelled' })
      .where('"user1Id" = :uid', { uid: userId })
      .andWhere('status = :status', { status: 'waiting' })
      .execute()
  }

  async update(id: string, data: Partial<Duel>): Promise<void> {
    await this.repo.update(id, data)
  }

  async getLanguageQueueCounts(): Promise<{ language: string; count: number }[]> {
    const rows = await this.repo
      .createQueryBuilder('d')
      .select('d.language', 'language')
      .addSelect('COUNT(*)', 'count')
      .where('d.status = :status', { status: 'waiting' })
      .andWhere("d.\"createdAt\" > NOW() - INTERVAL '120 seconds'")
      .groupBy('d.language')
      .getRawMany<{ language: string; count: string }>()
    return rows.map(r => ({ language: r.language ?? 'any', count: parseInt(r.count, 10) }))
  }

  async countTodayForfeits(userId: string): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('d')
      .where('d.status = :status', { status: 'completed' })
      .andWhere('d."isForfeit" = true')
      .andWhere('(d."user1Id" = :uid OR d."user2Id" = :uid)', { uid: userId })
      .andWhere('d."winnerId" != :uid::text', { uid: userId })
      .andWhere("d.\"createdAt\" > NOW() - INTERVAL '24 hours'")
      .getCount()
    return result
  }

  async getLeaderboard(): Promise<DuelLeaderboardEntry[]> {
    const rows: Array<{
      userId: string; username: string; profilePhotoUrl: string | null
      totalDuels: string; wins: string; losses: string; draws: string; totalScore: string
    }> = await this.repo.query(`
      SELECT
        u.id AS "userId",
        u.username,
        u."profilePhotoUrl",
        COUNT(*)::int AS "totalDuels",
        SUM(CASE
          WHEN d."winnerId" = u.id::text AND d."isForfeit" = false THEN 1.0
          WHEN d."winnerId" = u.id::text AND d."isForfeit" = true THEN 0.5
          ELSE 0 END)::float AS wins,
        SUM(CASE WHEN d."winnerId" != u.id::text AND d."winnerId" IS NOT NULL THEN 1 ELSE 0 END)::int AS losses,
        SUM(CASE WHEN d."winnerId" IS NULL THEN 1 ELSE 0 END)::int AS draws,
        SUM(CASE WHEN d."user1Id" = u.id THEN d."user1TotalScore" ELSE d."user2TotalScore" END)::int AS "totalScore"
      FROM users u
      JOIN duels d ON (d."user1Id" = u.id OR d."user2Id" = u.id)
      WHERE d.status = 'completed'
      GROUP BY u.id, u.username, u."profilePhotoUrl"
      ORDER BY wins DESC, "totalScore" DESC
    `)

    return rows.map((r, i) => ({
      rank: i + 1,
      userId: r.userId,
      username: r.username,
      profilePhotoUrl: r.profilePhotoUrl ?? null,
      totalDuels: Number(r.totalDuels),
      wins: Number(r.wins),
      losses: Number(r.losses),
      draws: Number(r.draws),
      totalScore: Number(r.totalScore),
      winRate: Number(r.totalDuels) > 0 ? Math.round((Number(r.wins) / Number(r.totalDuels)) * 100) : 0,
    }))
  }
}
