import axios, { AxiosInstance } from 'axios'
import { UserProfile, UpdatePasswordRequest, ChallengeHistoryItem, UserSearchResult, PublicUserProfile } from '@amalia/shared'

export class UserRepository {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/user`,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
  }

  async getProfile(): Promise<UserProfile> {
    const response = await this.client.get<UserProfile>('/me')
    return response.data
  }

  async updatePassword(request: UpdatePasswordRequest): Promise<void> {
    await this.client.patch('/password', request)
  }

  async deleteAccount(): Promise<void> {
    await this.client.delete('/')
  }

  async getHistory(): Promise<ChallengeHistoryItem[]> {
    const response = await this.client.get<ChallengeHistoryItem[]>('/history')
    return response.data
  }

  async searchUsers(query: string, limit: number = 20): Promise<UserSearchResult[]> {
    const response = await this.client.get<UserSearchResult[]>('/search', { params: { q: query, limit } })
    return response.data
  }

  async getPublicProfile(userId: string): Promise<PublicUserProfile> {
    const response = await this.client.get<PublicUserProfile>(`/${userId}/profile`)
    return response.data
  }

  async getPublicHistory(userId: string): Promise<ChallengeHistoryItem[]> {
    const response = await this.client.get<ChallengeHistoryItem[]>(`/${userId}/challenge-history`)
    return response.data
  }

  async updateLanguage(language: string): Promise<void> {
    await this.client.patch('/language', { language })
  }
}
