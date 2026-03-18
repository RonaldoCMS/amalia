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

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } })
  }

  async findByGithubId(githubId: string): Promise<User | null> {
    return this.repository.findOne({ where: { githubId } })
  }
}