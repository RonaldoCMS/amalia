import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm' 
import { ChallengeType, ChallengeLevel, ChallengeLanguage } from '@amalia/shared'
import { Challenge } from 'src/entities/challenge.entity'

@Injectable()
export class ChallengeRepository {
  constructor(
    @InjectRepository(Challenge)
    private readonly repository: Repository<Challenge>,
  ) {}

  async findUnseen(
    userId: string,
    type: ChallengeType,
    level: ChallengeLevel,
    language: ChallengeLanguage,
  ): Promise<Challenge | null> {
    return this.repository
      .createQueryBuilder('challenge')
      .leftJoin('challenge.userChallenges', 'uc', 'uc.userId = :userId', { userId })
      .where('challenge.type = :type', { type })
      .andWhere('challenge.level = :level', { level })
      .andWhere('challenge.language = :language', { language })
      .andWhere('uc.id IS NULL')
      .orderBy('RANDOM()')
      .getOne()
  }

  async findMany(
    type: ChallengeType,
    level: ChallengeLevel,
    language: ChallengeLanguage,
    limit: number,
  ): Promise<Challenge[]> {
    return this.repository
      .createQueryBuilder('c')
      .where('c.type = :type', { type })
      .andWhere('c.level = :level', { level })
      .andWhere('c.language = :language', { language })
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany()
  }

  async save(challenge: Partial<Challenge>): Promise<Challenge> {
    return this.repository.save(challenge)
  }

  async updateTranslations(id: string, translations: Record<string, { title: string; description: string; options: string[] }>): Promise<void> {
    await this.repository.update(id, { translations })
  }
}