import { AuthRepository } from '../repositories/auth.repository'
import { LoginRequest, RegisterRequest, AuthResponse } from '@amalia/shared'

export class AuthService {
  private readonly repository: AuthRepository

  constructor() {
    this.repository = new AuthRepository()
  }

  register(request: RegisterRequest): Promise<AuthResponse> {
    return this.repository.register(request)
  }

  login(request: LoginRequest): Promise<AuthResponse> {
    return this.repository.login(request)
  }
}