import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('auth')
export class GetGithubController {
  @Get('github')
  @UseGuards(AuthGuard('github'))
  github() {}
}