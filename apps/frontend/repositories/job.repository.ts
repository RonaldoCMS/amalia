import axios, { AxiosInstance } from 'axios'
import {
  CreateJobOfferRequest, JobOfferItem, JobOfferDetail,
  JobCandidateItem, JobApplicationItem, JobMessageItem,
  SendOfferToDevsRequest, SendJobMessageRequest,
} from '@amalia/shared'

export class JobRepository {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs`,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
  }

  async createOffer(data: CreateJobOfferRequest): Promise<JobOfferItem> {
    const res = await this.client.post<JobOfferItem>('', data)
    return res.data
  }

  async getMyOffers(): Promise<JobOfferItem[]> {
    const res = await this.client.get<JobOfferItem[]>('/mine')
    return res.data
  }

  async getReceivedOffers(): Promise<JobApplicationItem[]> {
    const res = await this.client.get<JobApplicationItem[]>('/received')
    return res.data
  }

  async getOfferDetail(offerId: string): Promise<JobOfferDetail> {
    const res = await this.client.get<JobOfferDetail>(`/${offerId}`)
    return res.data
  }

  async getCandidates(offerId: string): Promise<JobCandidateItem[]> {
    const res = await this.client.get<JobCandidateItem[]>(`/${offerId}/candidates`)
    return res.data
  }

  async sendOfferToDevs(offerId: string, data: SendOfferToDevsRequest): Promise<{ sent: number }> {
    const res = await this.client.post<{ sent: number }>(`/${offerId}/send`, data)
    return res.data
  }

  async closeOffer(offerId: string): Promise<void> {
    await this.client.post(`/${offerId}/close`)
  }

  async getMessages(applicationId: string): Promise<JobMessageItem[]> {
    const res = await this.client.get<JobMessageItem[]>(`/applications/${applicationId}/messages`)
    return res.data
  }

  async sendMessage(applicationId: string, data: SendJobMessageRequest): Promise<JobMessageItem> {
    const res = await this.client.post<JobMessageItem>(`/applications/${applicationId}/messages`, data)
    return res.data
  }
}
