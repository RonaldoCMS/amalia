import axios, { AxiosInstance } from 'axios'
import {
  CvSession,
  CvSendMessageRequest,
  CvSendMessageResponse,
  PublicCvItem,
} from '@amalia/shared'

export class CvRepository {
  private readonly client: AxiosInstance
  private readonly publicClient: AxiosInstance

  constructor() {
    const base = `${process.env.NEXT_PUBLIC_BACKEND_URL}/cv`

    this.client = axios.create({ baseURL: base, headers: { 'Content-Type': 'application/json' } })
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })

    // Public client — no auth header
    this.publicClient = axios.create({ baseURL: base, headers: { 'Content-Type': 'application/json' } })
  }

  async getMyCv(): Promise<CvSession | null> {
    const res = await this.client.get<CvSession | null>('/me')
    return res.data
  }

  async startInterview(): Promise<CvSession> {
    const res = await this.client.post<CvSession>('/start')
    return res.data
  }

  async sendMessage(cvId: string, content: string): Promise<CvSendMessageResponse> {
    const res = await this.client.post<CvSendMessageResponse>(`/${cvId}/message`, { content } satisfies CvSendMessageRequest)
    return res.data
  }

  async generateCv(cvId: string): Promise<CvSession> {
    const res = await this.client.post<CvSession>(`/${cvId}/generate`)
    return res.data
  }

  async deleteMyCv(): Promise<void> {
    await this.client.delete('/me')
  }

  async getGallery(): Promise<PublicCvItem[]> {
    const res = await this.publicClient.get<PublicCvItem[]>('/gallery')
    return res.data
  }

  async getPublicByUsername(username: string): Promise<CvSession> {
    const res = await this.publicClient.get<CvSession>(`/public/${username}`)
    return res.data
  }
}
