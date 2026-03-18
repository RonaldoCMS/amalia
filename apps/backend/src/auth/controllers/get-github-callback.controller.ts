import { Controller, Get, UseGuards, Request, Res } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from '../auth.service'
import { Response } from 'express'
import { ConfigService } from '@nestjs/config'

@Controller('auth')
export class GetGithubCallbackController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async callback(@Request() req: any, @Res() res: Response) {
    const { accessToken } = await this.authService.githubLogin(req.user)
    const frontendUrl = this.config.get<string>('FRONTEND_URL')
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`)
  }
}