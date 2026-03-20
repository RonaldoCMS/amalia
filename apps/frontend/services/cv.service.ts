import { CvRepository } from '../repositories/cv.repository'
import { CvSession, CvSendMessageResponse, PublicCvItem } from '@amalia/shared'

export class CvService {
  private readonly repository = new CvRepository()

  getMyCv(lang?: string): Promise<CvSession | null> {
    return this.repository.getMyCv(lang)
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

  getGallery(lang?: string): Promise<PublicCvItem[]> {
    return this.repository.getGallery(lang)
  }

  getPublicByUsername(username: string, lang?: string): Promise<CvSession> {
    return this.repository.getPublicByUsername(username, lang)
  }
}
