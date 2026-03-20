import axios, { AxiosInstance } from 'axios'
import {
  GenerateChallengeRequest,
  EvaluateChallengeRequest,
  ChallengeResponse,
  EvaluationResponse,
  UserStats,
} from '@amalia/shared'

export class ChallengeRepository {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/challenges`,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
  }

  async generate(request: GenerateChallengeRequest, lang?: string): Promise<ChallengeResponse> {
    const response = await this.client.post<ChallengeResponse>('/generate', request, { params: { lang } })
    return response.data
  }

  async evaluate(request: EvaluateChallengeRequest, lang?: string): Promise<EvaluationResponse> {
    const response = await this.client.post<EvaluationResponse>('/evaluate', request, { params: { lang } })
    return response.data
  }

  async getStats(): Promise<UserStats> {
    const response = await this.client.get<UserStats>('/stats')
    return response.data
  }
}