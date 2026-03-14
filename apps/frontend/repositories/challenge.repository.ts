import axios, { AxiosInstance } from 'axios'
import {
  GenerateChallengeRequest,
  EvaluateChallengeRequest,
  ChallengeResponse,
  EvaluationResponse,
} from '@amelia/shared'

export class ChallengeRepository {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/challenges`,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.request.use(config => {

      console.log('Request config:', config) // Log the request configuration for debugging

      console.log('Current localStorage:', localStorage) // Log the entire localStorage for debugging

      console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL) // Log the backend URL for debugging

      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
  }

  async generate(request: GenerateChallengeRequest): Promise<ChallengeResponse> {
    try {
      console.log('Generating challenge with request:', request) // Log the request data for debugging
      const response = await this.client.post<ChallengeResponse>('/generate', request)
      return response.data
    } catch (error) {
      console.error('Error generating challenge:', error) // Log the error for debugging
      throw error
    }
  }

  async evaluate(request: EvaluateChallengeRequest): Promise<EvaluationResponse> {
    const response = await this.client.post<EvaluationResponse>('/evaluate', request)
    return response.data
  }
}