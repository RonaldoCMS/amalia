import axios, { AxiosInstance } from 'axios'
import { NotificationItem, UnreadCountResponse } from '@amalia/shared'

export class NotificationRepository {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/notifications`,
      headers: { 'Content-Type': 'application/json' },
    })
    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
  }

  async getAll(): Promise<NotificationItem[]> {
    const { data } = await this.client.get<NotificationItem[]>('/')
    return data
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const { data } = await this.client.get<UnreadCountResponse>('/unread-count')
    return data
  }

  async markAllRead(): Promise<void> {
    await this.client.post('/read-all')
  }

  async markRead(id: string): Promise<void> {
    await this.client.post(`/${id}/read`)
  }
}
