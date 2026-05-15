import { Injectable, NotFoundException } from '@nestjs/common'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { UserChallengeRepository } from '../../shared/repositories/pg/user-challenge.repository'
import { DuelRepository } from '../../shared/repositories/pg/duel.repository'
import { PublicUserProfile } from '@amalia/shared'

@Injectable()
export class GetPublicProfileUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userChallengeRepository: UserChallengeRepository,
    private readonly duelRepository: DuelRepository,
  ) {}

  async execute(userId: string): Promise<PublicUserProfile> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundException('Utente non trovato')

    const challengeStats = await this.userChallengeRepository.getStats(userId)

    // Get duel stats from leaderboard data
    const leaderboard = await this.duelRepository.getLeaderboard()
    const entry = leaderboard.find(e => e.userId === userId)

    return {
      id: user.id,
      username: user.username,
      profilePhotoUrl: user.profilePhotoUrl,
      role: user.role,
      bio: user.onboarding?.bio ?? null,
      languages: user.onboarding?.languages ?? [],
      goals: user.onboarding?.goals ?? [],
      jobType: user.onboarding?.jobType ?? null,
      yearsOfExperience: user.onboarding?.yearsOfExperience ?? null,
      workStyle: user.onboarding?.workStyle ?? null,
      githubUrl: user.onboarding?.githubUrl ?? null,
      challengeStats,
      duelStats: {
        totalDuels: entry?.totalDuels ?? 0,
        wins: entry?.wins ?? 0,
        losses: entry?.losses ?? 0,
        winRate: entry?.winRate ?? 0,
      },
      createdAt: user.createdAt.toISOString(),
    }
  }
}
