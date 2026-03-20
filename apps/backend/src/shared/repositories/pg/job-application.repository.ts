import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { JobApplication } from 'src/entities/job-application.entity'

@Injectable()
export class JobApplicationRepository {
  constructor(
    @InjectRepository(JobApplication)
    private readonly repository: Repository<JobApplication>,
  ) {}

  async create(
    offerId: string,
    recruiterId: string,
    developerId: string,
    matchPercentage: number,
  ): Promise<JobApplication> {
    const app = this.repository.create({
      offerId,
      recruiterId,
      developerId,
      matchPercentage,
      status: 'sent',
    })
    return this.repository.save(app)
  }

  async findById(id: string): Promise<JobApplication | null> {
    return this.repository.findOne({ where: { id } })
  }

  async findByOfferId(offerId: string): Promise<JobApplication[]> {
    return this.repository.find({
      where: { offerId },
      order: { createdAt: 'DESC' },
    })
  }

  async findByDeveloperId(developerId: string): Promise<JobApplication[]> {
    return this.repository.find({
      where: { developerId },
      order: { createdAt: 'DESC' },
    })
  }

  async existsForOfferAndDev(offerId: string, developerId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { offerId, developerId },
    })
    return count > 0
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.repository.update(id, { status })
  }

  async countByOfferId(offerId: string): Promise<number> {
    return this.repository.count({ where: { offerId } })
  }
}
