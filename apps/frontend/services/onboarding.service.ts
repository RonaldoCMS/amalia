import { OnboardingRepository } from '../repositories/onboarding.repository'
import { OnboardingRequest, OnboardingResponse } from '@amalia/shared'

export class OnboardingService {
  private readonly repository: OnboardingRepository

  constructor() {
    this.repository = new OnboardingRepository()
  }

  get(): Promise<OnboardingResponse> {
    return this.repository.get()
  }

  save(request: OnboardingRequest): Promise<OnboardingResponse> {
    return this.repository.save(request)
  }
}
