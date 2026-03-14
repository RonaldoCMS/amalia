import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from '../auth.service'
import { RegisterRequest, AuthResponse } from '@amelia/shared'

@Controller('auth')
export class PostRegisterController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterRequest): Promise<AuthResponse> {
    return this.authService.register(body)
  }
}