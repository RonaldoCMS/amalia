import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JobMessage } from 'src/entities/job-message.entity'

@Injectable()
export class JobMessageRepository {
  constructor(
    @InjectRepository(JobMessage)
    private readonly repository: Repository<JobMessage>,
  ) {}

  async getMessages(applicationId: string): Promise<JobMessage[]> {
    return this.repository.find({
      where: { applicationId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    })
  }

  async send(
    applicationId: string,
    senderId: string,
    content: string | null,
    isOfferPreview = false,
  ): Promise<JobMessage> {
    const msg = this.repository.create({
      applicationId,
      senderId,
      content,
      isOfferPreview,
    })
    return this.repository.save(msg)
  }

  async markRead(applicationId: string, userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(JobMessage)
      .set({ read: true })
      .where('"applicationId" = :applicationId AND "senderId" != :userId AND read = false', {
        applicationId,
        userId,
      })
      .execute()
  }
}
