import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from '../auth.service'
import { LoginRequest, AuthResponse } from '@amalia/shared'

@Controller('auth')
export class PostLoginController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginRequest): Promise<AuthResponse> {
    return this.authService.login(body)
  }
}