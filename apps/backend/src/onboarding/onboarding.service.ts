import { Injectable, NotFoundException } from '@nestjs/common'
import { UserOnboardingRepository } from '../shared/repositories/pg/user-onboarding.repository'
import { UserRepository } from '../shared/repositories/pg/user.repository'
import { OnboardingRequest, OnboardingResponse } from '@amalia/shared'

function safe(v: string[] | null | undefined): string[] {
  if (!v || (v.length === 1 && v[0] === '')) return []
  return v
}

@Injectable()
export class OnboardingService {
  constructor(
    private readonly onboardingRepository: UserOnboardingRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async get(userId: string): Promise<OnboardingResponse> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundException('Utente non trovato')

    const o = user.onboarding
    if (!o) {
      return {
        completed: false,
        email: user.email,
        languages: [], yearsOfExperience: null, jobType: null,
        goals: [], workStyle: null, availability: null, bio: null, githubUrl: null,
      }
    }

    return {
      completed: o.completed,
      email: user.email,
      languages: safe(o.languages),
      yearsOfExperience: o.yearsOfExperience,
      jobType: o.jobType,
      goals: safe(o.goals),
      workStyle: o.workStyle,
      availability: o.availability,
      bio: o.bio,
      githubUrl: o.githubUrl,
    }
  }

  async save(userId: string, request: OnboardingRequest): Promise<OnboardingResponse> {
    // Persist email on the User entity
    await this.userRepository.updateEmail(userId, request.email)
    await this.onboardingRepository.upsert(userId, request)
    return this.get(userId)
  }
}
