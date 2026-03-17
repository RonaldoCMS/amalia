import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common'
import { OnboardingService } from './onboarding.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { OnboardingRequest, OnboardingResponse } from '@amelia/shared'

@Controller('onboarding')
@UseGuards(JwtGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get()
  get(@Request() req: { user: { id: string } }): Promise<OnboardingResponse> {
    return this.onboardingService.get(req.user.id)
  }

  @Post()
  save(
    @Body() body: OnboardingRequest,
    @Request() req: { user: { id: string } },
  ): Promise<OnboardingResponse> {
    return this.onboardingService.save(req.user.id, body)
  }
}
