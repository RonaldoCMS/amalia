import { Injectable } from '@nestjs/common'
import { RegisterRequest, LoginRequest, AuthResponse } from '@amelia/shared'
import { RegisterUseCase } from './usecases/register.usecase'
import { LoginUseCase } from './usecases/login.usecase'

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  register(request: RegisterRequest): Promise<AuthResponse> {
    return this.registerUseCase.execute(request)
  }

  login(request: LoginRequest): Promise<AuthResponse> {
    return this.loginUseCase.execute(request)
  }
}