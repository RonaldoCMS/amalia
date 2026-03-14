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

  async save(user: Partial<User>): Promise<User> {
    return this.repository.save(user)
  }
}