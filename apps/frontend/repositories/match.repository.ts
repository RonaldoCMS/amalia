import axios, { AxiosInstance } from 'axios'
import { MatchSuggestion, MatchItem, LikeResponse } from '@amalia/shared'

export class MatchRepository {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/match`,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
  }

  async getSuggestions(): Promise<MatchSuggestion[]> {
    const res = await this.client.get<MatchSuggestion[]>('/suggestions')
    return res.data
  }

  async getMatches(): Promise<MatchItem[]> {
    const res = await this.client.get<MatchItem[]>('/')
    return res.data
  }

  async getMatch(matchId: string): Promise<MatchItem | null> {
    try {
      const res = await this.client.get<MatchItem>(`/by/${matchId}`)
      return res.data
    } catch { return null }
  }

  async like(userId: string): Promise<LikeResponse> {
    const res = await this.client.post<LikeResponse>(`/like/${userId}`)
    return res.data
  }

  async archiveMatch(matchId: string): Promise<void> {
    await this.client.delete(`/${matchId}`)
  }
}
