import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DevMatch } from 'src/entities/dev-match.entity'

@Injectable()
export class DevMatchRepository {
  constructor(
    @InjectRepository(DevMatch)
    private readonly repository: Repository<DevMatch>,
  ) {}

  async findExact(user1Id: string, user2Id: string): Promise<DevMatch | null> {
    return this.repository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user1', 'u1')
      .leftJoinAndSelect('m.user2', 'u2')
      .where('u1.id = :user1Id AND u2.id = :user2Id', { user1Id, user2Id })
      .getOne()
  }

  async findByUsers(user1Id: string, user2Id: string): Promise<DevMatch | null> {
    return this.repository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user1', 'u1')
      .leftJoinAndSelect('m.user2', 'u2')
      .where('(u1.id = :user1Id AND u2.id = :user2Id) OR (u1.id = :user2Id AND u2.id = :user1Id)', { user1Id, user2Id })
      .getOne()
  }

  async findById(id: string): Promise<DevMatch | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user1', 'user2'],
    })
  }

  async getInteractedUserIds(userId: string): Promise<string[]> {
    const matches = await this.repository
      .createQueryBuilder('m')
      .select(['m.id', 'u1.id', 'u2.id', 'm.matchedAt'])
      .leftJoin('m.user1', 'u1')
      .leftJoin('m.user2', 'u2')
      .where('u1.id = :userId OR u2.id = :userId', { userId })
      .getRawMany()

    // Only exclude:
    // - Users the current user has already liked (userId is user1)
    // - Users already mutually matched (matchedAt set), regardless of direction
    return matches
      .filter(m => m.u1_id === userId || m.m_matchedAt !== null)
      .map(m => (m.u1_id === userId ? m.u2_id : m.u1_id))
  }

  async createLike(fromUserId: string, toUserId: string, score: number): Promise<DevMatch> {
    const record = this.repository.create({
      user1: { id: fromUserId } as any,
      user2: { id: toUserId } as any,
      user1Liked: true,
      user2Liked: false,
      compatibilityScore: score,
    })
    return this.repository.save(record)
  }

  async setMutualMatch(match: DevMatch): Promise<DevMatch> {
    match.user2Liked = true
    match.matchedAt = new Date()
    return this.repository.save(match)
  }

  async setReverseMutualMatch(match: DevMatch): Promise<DevMatch> {
    match.user2Liked = true
    match.matchedAt = new Date()
    return this.repository.save(match)
  }

  async archiveByUser(matchId: string, userId: string): Promise<void> {
    const match = await this.findById(matchId)
    if (!match) return
    if (match.user1.id === userId) match.archivedByUser1 = true
    else if (match.user2.id === userId) match.archivedByUser2 = true
    await this.repository.save(match)
  }

  async isArchivedFor(matchId: string, userId: string): Promise<boolean> {
    const match = await this.findById(matchId)
    if (!match) return true
    if (match.user1.id === userId && match.archivedByUser1) return true
    if (match.user2.id === userId && match.archivedByUser2) return true
    return false
  }

  async getMyMatches(userId: string): Promise<DevMatch[]> {
    const all = await this.repository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user1', 'u1')
      .leftJoinAndSelect('m.user2', 'u2')
      .where('(u1.id = :userId OR u2.id = :userId) AND m.matchedAt IS NOT NULL', { userId })
      .orderBy('m.matchedAt', 'DESC')
      .getMany()
    return all.filter(m => {
      if (m.user1.id === userId && m.archivedByUser1) return false
      if (m.user2.id === userId && m.archivedByUser2) return false
      return true
    })
  }
}
