import { Module } from '@nestjs/common'
import { CvController } from './cv.controller'
import { CvService } from './cv.service'
import { StartInterviewUseCase } from './usecases/start-interview.usecase'
import { SendMessageUseCase } from './usecases/send-message.usecase'
import { GenerateCvUseCase } from './usecases/generate-cv.usecase'
import { GetMyCvUseCase } from './usecases/get-my-cv.usecase'
import { GetPublicCvsUseCase } from './usecases/get-public-cvs.usecase'

@Module({
  controllers: [CvController],
  providers: [
    CvService,
    StartInterviewUseCase,
    SendMessageUseCase,
    GenerateCvUseCase,
    GetMyCvUseCase,
    GetPublicCvsUseCase,
  ],
})
export class CvModule {}
