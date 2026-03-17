import axios, { AxiosInstance } from 'axios'
import { OnboardingRequest, OnboardingResponse } from '@amelia/shared'

export class OnboardingRepository {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/onboarding`,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
  }

  async get(): Promise<OnboardingResponse> {
    const res = await this.client.get<OnboardingResponse>('/')
    return res.data
  }

  async save(request: OnboardingRequest): Promise<OnboardingResponse> {
    const res = await this.client.post<OnboardingResponse>('/', request)
    return res.data
  }
}
