import { CvRepository } from '../repositories/cv.repository'
import { CvSession, CvSendMessageResponse, PublicCvItem } from '@amalia/shared'

export class CvService {
  private readonly repository = new CvRepository()

  getMyCv(): Promise<CvSession | null> {
    return this.repository.getMyCv()
  }

  startInterview(): Promise<CvSession> {
    return this.repository.startInterview()
  }

  sendMessage(cvId: string, content: string): Promise<CvSendMessageResponse> {
    return this.repository.sendMessage(cvId, content)
  }

  generateCv(cvId: string): Promise<CvSession> {
    return this.repository.generateCv(cvId)
  }

  deleteMyCv(): Promise<void> {
    return this.repository.deleteMyCv()
  }

  getGallery(): Promise<PublicCvItem[]> {
    return this.repository.getGallery()
  }

  getPublicByUsername(username: string): Promise<CvSession> {
    return this.repository.getPublicByUsername(username)
  }
}
