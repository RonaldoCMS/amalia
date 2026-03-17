import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { UserChallenge } from 'src/entities/user-challenge.entity'
import { Repository } from 'typeorm'
import { UserStats, ChallengeHistoryItem } from '@amalia/shared'

@Injectable()
export class UserChallengeRepository {
  constructor(
    @InjectRepository(UserChallenge)
    private readonly repository: Repository<UserChallenge>,
  ) {}

  async save(userId: string, challengeId: string): Promise<UserChallenge> {
    return this.repository.save({ user: { id: userId }, challenge: { id: challengeId } })
  }

  async findByUserAndChallenge(userId: string, challengeId: string): Promise<UserChallenge | null> {
    return this.repository.findOne({
      where: { user: { id: userId }, challenge: { id: challengeId } },
      order: { createdAt: 'DESC' },
    })
  }

  async updateResult(id: string, correct: boolean, score: number): Promise<void> {
    await this.repository.update(id, { correct, score })
  }

  async getStats(userId: string): Promise<UserStats> {
    const result = await this.repository
      .createQueryBuilder('uc')
      .select('COALESCE(SUM(uc.score), 0)', 'totalScore')
      .addSelect('COUNT(CASE WHEN uc.correct = true THEN 1 END)', 'correctCount')
      .addSelect('COUNT(CASE WHEN uc.correct = false THEN 1 END)', 'wrongCount')
      .where('uc.userId = :userId', { userId })
      .andWhere('uc.correct IS NOT NULL')
      .getRawOne<{ totalScore: string; correctCount: string; wrongCount: string }>()

    return {
      totalScore: parseInt(result.totalScore ?? '0', 10),
      correctCount: parseInt(result.correctCount ?? '0', 10),
      wrongCount: parseInt(result.wrongCount ?? '0', 10),
    }
  }

  async getHistory(userId: string): Promise<ChallengeHistoryItem[]> {
    const rows = await this.repository
      .createQueryBuilder('uc')
      .innerJoinAndSelect('uc.challenge', 'challenge')
      .where('uc.userId = :userId', { userId })
      .andWhere('uc.correct IS NOT NULL')
      .orderBy('uc.createdAt', 'DESC')
      .getMany()

    return rows.map(uc => ({
      id: uc.id,
      correct: uc.correct,
      score: uc.score,
      createdAt: uc.createdAt.toISOString(),
      challenge: {
        id: uc.challenge.id,
        title: uc.challenge.title,
        description: uc.challenge.description,
        type: uc.challenge.type,
        level: uc.challenge.level,
        language: uc.challenge.language,
      },
    }))
  }
}