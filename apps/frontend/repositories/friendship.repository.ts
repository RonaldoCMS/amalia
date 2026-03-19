import axios, { AxiosInstance } from 'axios'
import { FriendshipItem, FriendshipStatusResponse } from '@amalia/shared'

export class FriendshipRepository {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/friendships`,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
  }

  async sendRequest(userId: string): Promise<{ id: string }> {
    const res = await this.client.post<{ id: string }>(`/request/${userId}`)
    return res.data
  }

  async acceptRequest(friendshipId: string): Promise<void> {
    await this.client.post(`/${friendshipId}/accept`)
  }

  async rejectRequest(friendshipId: string): Promise<void> {
    await this.client.post(`/${friendshipId}/reject`)
  }

  async getFriends(): Promise<FriendshipItem[]> {
    const res = await this.client.get<FriendshipItem[]>('/')
    return res.data
  }

  async getPendingRequests(): Promise<FriendshipItem[]> {
    const res = await this.client.get<FriendshipItem[]>('/pending')
    return res.data
  }

  async getStatus(userId: string): Promise<FriendshipStatusResponse> {
    const res = await this.client.get<FriendshipStatusResponse>(`/status/${userId}`)
    return res.data
  }

  async removeFriend(friendshipId: string): Promise<void> {
    await this.client.delete(`/${friendshipId}`)
  }
}
