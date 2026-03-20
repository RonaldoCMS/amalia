import { JobRepository } from '../repositories/job.repository'
import {
  CreateJobOfferRequest, JobOfferItem, JobOfferDetail,
  JobCandidateItem, JobApplicationItem, JobMessageItem,
  SendOfferToDevsRequest, SendJobMessageRequest,
} from '@amalia/shared'

export class JobService {
  private readonly repository: JobRepository

  constructor() {
    this.repository = new JobRepository()
  }

  createOffer(data: CreateJobOfferRequest): Promise<JobOfferItem> {
    return this.repository.createOffer(data)
  }

  getMyOffers(): Promise<JobOfferItem[]> {
    return this.repository.getMyOffers()
  }

  getReceivedOffers(): Promise<JobApplicationItem[]> {
    return this.repository.getReceivedOffers()
  }

  getOfferDetail(offerId: string): Promise<JobOfferDetail> {
    return this.repository.getOfferDetail(offerId)
  }

  getCandidates(offerId: string): Promise<JobCandidateItem[]> {
    return this.repository.getCandidates(offerId)
  }

  sendOfferToDevs(offerId: string, developerIds: string[]): Promise<{ sent: number }> {
    return this.repository.sendOfferToDevs(offerId, { developerIds })
  }

  closeOffer(offerId: string): Promise<void> {
    return this.repository.closeOffer(offerId)
  }

  getMessages(applicationId: string): Promise<JobMessageItem[]> {
    return this.repository.getMessages(applicationId)
  }

  sendMessage(applicationId: string, content: string): Promise<JobMessageItem> {
    return this.repository.sendMessage(applicationId, { content })
  }
}
