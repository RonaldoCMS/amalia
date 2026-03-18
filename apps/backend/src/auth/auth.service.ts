import { Injectable } from '@nestjs/common'
import { RegisterRequest, LoginRequest, AuthResponse } from '@amalia/shared'
import { RegisterUseCase } from './usecases/register.usecase'
import { LoginUseCase } from './usecases/login.usecase'
import { GithubLoginUseCase } from './usecases/github-login.usecase'

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly githubLoginUseCase: GithubLoginUseCase,
  ) {}

  register(request: RegisterRequest): Promise<AuthResponse> {
    return this.registerUseCase.execute(request)
  }

  login(request: LoginRequest): Promise<AuthResponse> {
    return this.loginUseCase.execute(request)
  }

  githubLogin(profile: any): Promise<AuthResponse> {
  return this.githubLoginUseCase.execute(profile)
}
}