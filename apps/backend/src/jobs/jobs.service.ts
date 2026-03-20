import { Injectable } from '@nestjs/common'
import { CreateOfferUseCase } from './usecases/create-offer.usecase'
import { GetMyOffersUseCase } from './usecases/get-my-offers.usecase'
import { GetOfferDetailUseCase } from './usecases/get-offer-detail.usecase'
import { GetCandidatesUseCase } from './usecases/get-candidates.usecase'
import { SendOfferToDevsUseCase } from './usecases/send-offer-to-devs.usecase'
import { GetReceivedOffersUseCase } from './usecases/get-received-offers.usecase'
import { GetJobMessagesUseCase } from './usecases/get-job-messages.usecase'
import { SendJobMessageUseCase } from './usecases/send-job-message.usecase'
import { CloseOfferUseCase } from './usecases/close-offer.usecase'
import {
  CreateJobOfferRequest, JobOfferItem, JobOfferDetail,
  JobCandidateItem, JobApplicationItem, JobMessageItem,
  SendOfferToDevsRequest, SendJobMessageRequest,
} from '@amalia/shared'

@Injectable()
export class JobsService {
  constructor(
    private readonly createOfferUseCase: CreateOfferUseCase,
    private readonly getMyOffersUseCase: GetMyOffersUseCase,
    private readonly getOfferDetailUseCase: GetOfferDetailUseCase,
    private readonly getCandidatesUseCase: GetCandidatesUseCase,
    private readonly sendOfferToDevsUseCase: SendOfferToDevsUseCase,
    private readonly getReceivedOffersUseCase: GetReceivedOffersUseCase,
    private readonly getJobMessagesUseCase: GetJobMessagesUseCase,
    private readonly sendJobMessageUseCase: SendJobMessageUseCase,
    private readonly closeOfferUseCase: CloseOfferUseCase,
  ) {}

  createOffer(userId: string, data: CreateJobOfferRequest): Promise<JobOfferItem> {
    return this.createOfferUseCase.execute(userId, data)
  }

  getMyOffers(userId: string): Promise<JobOfferItem[]> {
    return this.getMyOffersUseCase.execute(userId)
  }

  getOfferDetail(offerId: string): Promise<JobOfferDetail> {
    return this.getOfferDetailUseCase.execute(offerId)
  }

  getCandidates(offerId: string, userId: string): Promise<JobCandidateItem[]> {
    return this.getCandidatesUseCase.execute(offerId, userId)
  }

  sendOfferToDevs(offerId: string, userId: string, data: SendOfferToDevsRequest): Promise<{ sent: number }> {
    return this.sendOfferToDevsUseCase.execute(offerId, userId, data)
  }

  getReceivedOffers(userId: string): Promise<JobApplicationItem[]> {
    return this.getReceivedOffersUseCase.execute(userId)
  }

  getMessages(applicationId: string, userId: string): Promise<JobMessageItem[]> {
    return this.getJobMessagesUseCase.execute(applicationId, userId)
  }

  sendMessage(applicationId: string, userId: string, content: string): Promise<JobMessageItem> {
    return this.sendJobMessageUseCase.execute(applicationId, userId, content)
  }

  closeOffer(offerId: string, userId: string): Promise<void> {
    return this.closeOfferUseCase.execute(offerId, userId)
  }
}
