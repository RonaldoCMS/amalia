import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CvMessage, CvData, CvAmaliaStats } from '@amalia/shared'
import { UserCv } from 'src/entities/user-cv.entity'

@Injectable()
export class CvRepository {
  constructor(
    @InjectRepository(UserCv)
    private readonly repository: Repository<UserCv>,
  ) {}

  async findByUserId(userId: string): Promise<UserCv | null> {
    return this.repository.findOne({ where: { userId }, order: { createdAt: 'DESC' } })
  }

  async findByUsername(username: string): Promise<UserCv | null> {
    return this.repository.findOne({ where: { username, status: 'ready', isPublic: true } })
  }

  async findAllPublic(limit = 50): Promise<UserCv[]> {
    return this.repository.find({
      where: { status: 'ready', isPublic: true },
      order: { createdAt: 'DESC' },
      take: limit,
    })
  }

  async create(userId: string, username: string, firstMessage: CvMessage, amaliaStats: CvAmaliaStats): Promise<UserCv> {
    return this.repository.save({
      userId,
      username,
      status: 'interviewing',
      messages: [firstMessage],
      amaliaStats,
      isPublic: true,
    })
  }

  async appendMessages(id: string, messages: CvMessage[]): Promise<void> {
    const cv = await this.repository.findOneByOrFail({ id })
    cv.messages = [...cv.messages, ...messages]
    await this.repository.save(cv)
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.repository.update(id, { status })
  }

  async updateCvData(id: string, cvData: CvData, amaliaStats: CvAmaliaStats): Promise<void> {
    await this.repository.update(id, { cvData, amaliaStats, status: 'ready' })
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.repository.delete({ userId })
  }
}
