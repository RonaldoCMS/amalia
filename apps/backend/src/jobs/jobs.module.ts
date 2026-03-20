import { Module } from '@nestjs/common'
import { JobsController } from './jobs.controller'
import { JobsService } from './jobs.service'
import { CreateOfferUseCase } from './usecases/create-offer.usecase'
import { GetMyOffersUseCase } from './usecases/get-my-offers.usecase'
import { GetOfferDetailUseCase } from './usecases/get-offer-detail.usecase'
import { GetCandidatesUseCase } from './usecases/get-candidates.usecase'
import { SendOfferToDevsUseCase } from './usecases/send-offer-to-devs.usecase'
import { GetReceivedOffersUseCase } from './usecases/get-received-offers.usecase'
import { GetJobMessagesUseCase } from './usecases/get-job-messages.usecase'
import { SendJobMessageUseCase } from './usecases/send-job-message.usecase'
import { CloseOfferUseCase } from './usecases/close-offer.usecase'
import { NotificationModule } from '../notifications/notification.module'

@Module({
  imports: [NotificationModule],
  controllers: [JobsController],
  providers: [
    JobsService,
    CreateOfferUseCase,
    GetMyOffersUseCase,
    GetOfferDetailUseCase,
    GetCandidatesUseCase,
    SendOfferToDevsUseCase,
    GetReceivedOffersUseCase,
    GetJobMessagesUseCase,
    SendJobMessageUseCase,
    CloseOfferUseCase,
  ],
})
export class JobsModule {}
