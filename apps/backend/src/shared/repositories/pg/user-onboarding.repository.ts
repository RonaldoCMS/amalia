import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserOnboarding } from 'src/entities/user-onboarding.entity'
import { OnboardingRequest } from '@amalia/shared'

@Injectable()
export class UserOnboardingRepository {
  constructor(
    @InjectRepository(UserOnboarding)
    private readonly repository: Repository<UserOnboarding>,
  ) {}

  async findByUserId(userId: string): Promise<UserOnboarding | null> {
    return this.repository.findOne({ where: { user: { id: userId } }, relations: ['user'] })
  }

  async upsert(userId: string, data: OnboardingRequest): Promise<UserOnboarding> {
    let onboarding = await this.findByUserId(userId)
    if (!onboarding) {
      onboarding = this.repository.create({ user: { id: userId } as any })
    }
    onboarding.languages = data.languages
    onboarding.yearsOfExperience = data.yearsOfExperience
    onboarding.jobType = data.jobType
    onboarding.goals = data.goals
    onboarding.workStyle = data.workStyle
    onboarding.availability = data.availability
    onboarding.bio = data.bio ?? null
    onboarding.githubUrl = data.githubUrl ?? null
    onboarding.completed = true
    return this.repository.save(onboarding)
  }

  async findCompletedExcluding(excludeIds: string[]): Promise<UserOnboarding[]> {
    const qb = this.repository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.user', 'user')
      .where('o.completed = true')

    if (excludeIds.length > 0) {
      qb.andWhere('user.id NOT IN (:...excludeIds)', { excludeIds })
    }

    return qb.getMany()
  }
}
