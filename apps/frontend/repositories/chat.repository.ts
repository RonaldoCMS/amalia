import axios, { AxiosInstance } from 'axios'
import { ChatMessageItem, SendMessageRequest } from '@amalia/shared'

export class ChatRepository {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
  }

  async getMessages(matchId: string): Promise<ChatMessageItem[]> {
    const res = await this.client.get<ChatMessageItem[]>(`/${matchId}`)
    return res.data
  }

  async sendMessage(matchId: string, request: SendMessageRequest): Promise<ChatMessageItem> {
    const res = await this.client.post<ChatMessageItem>(`/${matchId}`, request)
    return res.data
  }

  async sendImage(matchId: string, file: File): Promise<ChatMessageItem> {
    const form = new FormData()
    form.append('file', file)
    const token = localStorage.getItem('token')
    const res = await axios.post<ChatMessageItem>(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/${matchId}/image`,
      form,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return res.data
  }

  async sendSystemMessage(matchId: string, content: string, duelInviteId?: string): Promise<ChatMessageItem> {
    const res = await this.client.post<ChatMessageItem>(`/${matchId}/system`, { content, duelInviteId })
    return res.data
  }
}
