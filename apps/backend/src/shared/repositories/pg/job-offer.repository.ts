import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, MoreThan } from 'typeorm'
import { JobOffer } from 'src/entities/job-offer.entity'
import { CreateJobOfferRequest } from '@amalia/shared'

@Injectable()
export class JobOfferRepository {
  constructor(
    @InjectRepository(JobOffer)
    private readonly repository: Repository<JobOffer>,
  ) {}

  async create(authorId: string, data: CreateJobOfferRequest): Promise<JobOffer> {
    const offer = this.repository.create({
      authorId,
      title: data.title,
      description: data.description,
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      contractType: data.contractType,
      workMode: data.workMode,
      location: data.location,
      yearsRequired: data.yearsRequired,
      sector: data.sector,
      hardSkills: data.hardSkills,
      softSkills: data.softSkills,
      expiresAt: new Date(data.expiresAt),
      status: 'active',
    })
    const saved = await this.repository.save(offer)
    return this.repository.findOneOrFail({ where: { id: saved.id } })
  }

  async findById(id: string): Promise<JobOffer | null> {
    return this.repository.findOne({ where: { id } })
  }

  async findByAuthorId(authorId: string): Promise<JobOffer[]> {
    return this.repository.find({
      where: { authorId },
      order: { createdAt: 'DESC' },
    })
  }

  async findActive(): Promise<JobOffer[]> {
    return this.repository.find({
      where: { status: 'active', expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
    })
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.repository.update(id, { status })
  }

  async countApplications(offerId: string): Promise<number> {
    const offer = await this.repository
      .createQueryBuilder('o')
      .loadRelationCountAndMap('o.appCount', 'o.id')
      .where('o.id = :offerId', { offerId })
      .getOne()
    // We'll count from the application repo instead
    return 0
  }
}
