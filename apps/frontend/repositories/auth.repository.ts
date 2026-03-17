import axios, { AxiosInstance } from 'axios'
import { LoginRequest, RegisterRequest, AuthResponse } from '@amalia/shared'

export class AuthRepository {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/register', request)
    return response.data
  }

  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/login', request)
    return response.data
  }
}