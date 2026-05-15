import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/entities/user.entity'
import { Repository } from 'typeorm'

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } })
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id }, relations: ['onboarding'] })
  }

  async findAllWithOnboarding(): Promise<User[]> {
    return this.repository.find({ relations: ['onboarding'] })
  }

  async save(user: Partial<User>): Promise<User> {
    return this.repository.save(user)
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.repository.update(id, { password: hashedPassword })
  }

  async updateEmail(id: string, email: string): Promise<void> {
    await this.repository.update(id, { email })
  }

  async updateProfilePhoto(id: string, profilePhotoUrl: string): Promise<void> {
    await this.repository.update(id, { profilePhotoUrl })
  }

  async updateLanguage(id: string, preferredLanguage: string | null): Promise<void> {
    await this.repository.update(id, { preferredLanguage })
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } })
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    return this.repository.findOne({ where: { githubId } })
  }

  async searchByUsername(query: string, limit: number = 20): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.onboarding', 'onboarding')
      .where('user.username ILIKE :query', { query: `%${query}%` })
      .orderBy('user.username', 'ASC')
      .limit(limit)
      .getMany()
  }

  async updateFields(id: string, fields: Record<string, unknown>): Promise<void> {
    await this.repository.update(id, fields)
  }

  async count(): Promise<number> {
    return this.repository.count()
  }

  async countWhere(where: Record<string, unknown>): Promise<number> {
    return this.repository.count({ where })
  }

  async findAllPaginated(options: { page: number; limit: number; search?: string }): Promise<{ users: User[]; total: number }> {
    const qb = this.repository.createQueryBuilder('user')
      .leftJoinAndSelect('user.onboarding', 'onboarding')
      .orderBy('user.createdAt', 'DESC')

    if (options.search) {
      qb.andWhere('user.username ILIKE :search', { search: `%${options.search}%` })
    }

    const total = await qb.getCount()
    const users = await qb
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getMany()

    return { users, total }
  }
}