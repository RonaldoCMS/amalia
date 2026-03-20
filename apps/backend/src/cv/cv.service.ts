import { Injectable } from '@nestjs/common'
import { StartInterviewUseCase } from './usecases/start-interview.usecase'
import { SendMessageUseCase } from './usecases/send-message.usecase'
import { GenerateCvUseCase } from './usecases/generate-cv.usecase'
import { GetMyCvUseCase } from './usecases/get-my-cv.usecase'
import { GetPublicCvsUseCase } from './usecases/get-public-cvs.usecase'
import { CvRepository } from '../shared/repositories/pg/cv.repository'
import { CvSession, CvSendMessageResponse, PublicCvItem } from '@amalia/shared'

@Injectable()
export class CvService {
  constructor(
    private readonly startInterviewUseCase: StartInterviewUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly generateCvUseCase: GenerateCvUseCase,
    private readonly getMyCvUseCase: GetMyCvUseCase,
    private readonly getPublicCvsUseCase: GetPublicCvsUseCase,
    private readonly cvRepository: CvRepository,
  ) {}

  startInterview(userId: string): Promise<CvSession> {
    return this.startInterviewUseCase.execute(userId)
  }

  sendMessage(cvId: string, userId: string, content: string): Promise<CvSendMessageResponse> {
    return this.sendMessageUseCase.execute(cvId, userId, content)
  }

  generateCv(cvId: string, userId: string): Promise<CvSession> {
    return this.generateCvUseCase.execute(cvId, userId)
  }

  getMyCv(userId: string): Promise<CvSession | null> {
    return this.getMyCvUseCase.execute(userId)
  }

  getAllPublic(): Promise<PublicCvItem[]> {
    return this.getPublicCvsUseCase.getAll()
  }

  getPublicByUsername(username: string): Promise<CvSession> {
    return this.getPublicCvsUseCase.getByUsername(username)
  }

  deleteMyCV(userId: string): Promise<void> {
    return this.cvRepository.deleteByUserId(userId)
  }
}
