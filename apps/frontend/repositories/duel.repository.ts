import axios, { AxiosInstance } from 'axios'
import {
  DuelQueueResponse, DuelStateResponse, DuelAnswerRequest, DuelAnswerResponse,
  DuelLeaderboardEntry, DuelLanguageQueueCount, DuelInviteStatusResponse,
} from '@amelia/shared'

export class DuelRepository {
  private readonly client: AxiosInstance
  private readonly publicClient: AxiosInstance

  constructor() {
    const base = `${process.env.NEXT_PUBLIC_BACKEND_URL}/duels`
    this.client = axios.create({
      baseURL: base,
      headers: { 'Content-Type': 'application/json' },
    })
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
    this.publicClient = axios.create({ baseURL: base })
  }

  async joinQueue(language?: string): Promise<DuelQueueResponse> {
    const r = await this.client.post<DuelQueueResponse>('/queue', language ? { language } : {})
    return r.data
  }

  async leaveQueue(): Promise<void> {
    await this.client.delete('/queue')
  }

  async getQueueStatus(): Promise<DuelQueueResponse> {
    const r = await this.client.get<DuelQueueResponse>('/queue/status')
    return r.data
  }

  async getDuel(id: string): Promise<DuelStateResponse> {
    const r = await this.client.get<DuelStateResponse>(`/${id}`)
    return r.data
  }

  async submitAnswer(id: string, body: DuelAnswerRequest): Promise<DuelAnswerResponse> {
    const r = await this.client.post<DuelAnswerResponse>(`/${id}/answer`, body)
    return r.data
  }

  async forfeit(id: string): Promise<void> {
    await this.client.post(`/${id}/forfeit`)
  }

  async inviteUser(targetUserId: string, language?: string, chatMatchId?: string): Promise<DuelQueueResponse> {
    const body: Record<string, string> = {}
    if (language) body.language = language
    if (chatMatchId) body.chatMatchId = chatMatchId
    const r = await this.client.post<DuelQueueResponse>(`/invite/${targetUserId}`, body)
    return r.data
  }

  async expireInvite(duelId: string): Promise<void> {
    await this.client.post(`/${duelId}/expire`)
  }

  async acceptInvite(duelId: string): Promise<DuelQueueResponse> {
    const r = await this.client.post<DuelQueueResponse>(`/${duelId}/accept`)
    return r.data
  }

  async getInviteStatus(duelId: string): Promise<DuelInviteStatusResponse> {
    const r = await this.client.get<DuelInviteStatusResponse>(`/${duelId}/invite-status`)
    return r.data
  }

  async getLeaderboard(): Promise<DuelLeaderboardEntry[]> {
    const r = await this.publicClient.get<DuelLeaderboardEntry[]>('/leaderboard')
    return r.data
  }

  async getLanguageQueueCounts(): Promise<DuelLanguageQueueCount[]> {
    const r = await this.publicClient.get<DuelLanguageQueueCount[]>('/queue/languages')
    return r.data
  }
}
