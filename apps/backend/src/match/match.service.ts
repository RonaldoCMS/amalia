import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { DevMatchRepository } from '../shared/repositories/pg/dev-match.repository'
import { UserOnboardingRepository } from '../shared/repositories/pg/user-onboarding.repository'
import { UserRepository } from '../shared/repositories/pg/user.repository'
import { NotificationService } from '../notifications/notification.service'
import { MatchSuggestion, MatchItem, LikeResponse, NotificationType } from '@amalia/shared'
import { UserOnboarding } from '../entities/user-onboarding.entity'

function safe(v: string[] | null | undefined): string[] {
  if (!v || (v.length === 1 && v[0] === '')) return []
  return v
}

function computeCompatibility(a: UserOnboarding, b: UserOnboarding): number {
  let score = 0

  // Languages overlap (40 pts)
  const aLangs = new Set(safe(a.languages))
  const bLangs = new Set(safe(b.languages))
  const shared = [...aLangs].filter(l => bLangs.has(l)).length
  const maxLangs = Math.max(aLangs.size, bLangs.size, 1)
  score += Math.round((shared / maxLangs) * 40)

  // Experience proximity (20 pts)
  const order = ['0', '1-2', '3-5', '6-10', '10+']
  const ai = order.indexOf(a.yearsOfExperience)
  const bi = order.indexOf(b.yearsOfExperience)
  if (ai >= 0 && bi >= 0) {
    score += Math.round((1 - Math.abs(ai - bi) / 4) * 20)
  }

  // Goals overlap (30 pts)
  const aGoals = new Set(safe(a.goals))
  const bGoals = new Set(safe(b.goals))
  const sharedGoals = [...aGoals].filter(g => bGoals.has(g)).length
  const maxGoals = Math.max(aGoals.size, bGoals.size, 1)
  score += Math.round((sharedGoals / maxGoals) * 30)

  // Work style (10 pts)
  if (a.workStyle && b.workStyle && a.workStyle === b.workStyle) score += 10

  return Math.min(100, score)
}

@Injectable()
export class MatchService {
  constructor(
    private readonly devMatchRepository: DevMatchRepository,
    private readonly onboardingRepository: UserOnboardingRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async getSuggestions(userId: string): Promise<MatchSuggestion[]> {
    const myUser = await this.userRepository.findById(userId)
    if (!myUser?.onboarding?.completed) {
      return [] // Must complete onboarding first
    }
    const myOnboarding = myUser.onboarding

    const interactedIds = await this.devMatchRepository.getInteractedUserIds(userId)
    const exclude = [userId, ...interactedIds]

    const candidates = await this.onboardingRepository.findCompletedExcluding(exclude)

    return candidates
      .map(o => ({
        userId: o.user.id,
        username: o.user.username,
        profilePhotoUrl: o.user.profilePhotoUrl,
        compatibilityScore: computeCompatibility(myOnboarding, o),
        jobType: o.jobType,
        yearsOfExperience: o.yearsOfExperience,
        languages: safe(o.languages),
        goals: safe(o.goals),
        workStyle: o.workStyle,
        bio: o.bio,
        githubUrl: o.githubUrl,
      }))
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
  }

  async getMatchById(matchId: string, userId: string): Promise<MatchItem | null> {
    const match = await this.devMatchRepository.findById(matchId)
    if (!match || !match.matchedAt) return null
    const isUser1 = match.user1.id === userId
    const isUser2 = match.user2.id === userId
    if (!isUser1 && !isUser2) return null
    const partner = isUser1 ? match.user2 : match.user1
    return {
      matchId: match.id,
      userId: partner.id,
      username: partner.username,
      profilePhotoUrl: partner.profilePhotoUrl,
      compatibilityScore: match.compatibilityScore,
      matchedAt: match.matchedAt!.toISOString(),
    }
  }

  async like(fromUserId: string, toUserId: string): Promise<LikeResponse> {
    if (fromUserId === toUserId) throw new ForbiddenException('Cannot like yourself')

    // 1) Hanno già messo like a ME? (essi sono user1, io sono user2)
    const theyLikedMe = await this.devMatchRepository.findExact(toUserId, fromUserId)
    if (theyLikedMe) {
      if (theyLikedMe.matchedAt) {
        // Match già esistente
        return { matched: true, matchId: theyLikedMe.id }
      }
      // Loro hanno fatto like prima → ora è reciproco
      const updated = await this.devMatchRepository.setMutualMatch(theyLikedMe)
      // Notifica entrambi
      const fromUser = await this.userRepository.findById(fromUserId)
      const toUser = await this.userRepository.findById(toUserId)
      await this.notificationService.notify(toUserId, NotificationType.NewMatch, 'Nuovo match!', `Hai un match con ${fromUser?.username ?? 'un developer'}!`, updated.id)
      await this.notificationService.notify(fromUserId, NotificationType.NewMatch, 'Nuovo match!', `Hai un match con ${toUser?.username ?? 'un developer'}!`, updated.id)
      return { matched: true, matchId: updated.id }
    }

    // 2) Ho già messo like a LORO? (io sono user1, loro sono user2)
    const iLikedThem = await this.devMatchRepository.findExact(fromUserId, toUserId)
    if (iLikedThem) {
      return { matched: !!iLikedThem.matchedAt, matchId: iLikedThem.id }
    }

    // 3) Nessuna interazione precedente → crea nuovo like
    const myOnboarding = await this.onboardingRepository.findByUserId(fromUserId)
    const theirOnboarding = await this.onboardingRepository.findByUserId(toUserId)
    const score = myOnboarding && theirOnboarding
      ? computeCompatibility(myOnboarding, theirOnboarding)
      : 0

    const created = await this.devMatchRepository.createLike(fromUserId, toUserId, score)
    return { matched: false, matchId: created.id }
  }

  async archiveMatch(matchId: string, userId: string): Promise<void> {
    const match = await this.devMatchRepository.findById(matchId)
    if (!match || !match.matchedAt) throw new NotFoundException('Match non trovato')
    if (match.user1.id !== userId && match.user2.id !== userId) {
      throw new ForbiddenException('Non sei parte di questo match')
    }
    await this.devMatchRepository.archiveByUser(matchId, userId)
  }

  async getMatches(userId: string): Promise<MatchItem[]> {
    const matches = await this.devMatchRepository.getMyMatches(userId)
    return matches.map(m => {
      const partner = m.user1.id === userId ? m.user2 : m.user1
      return {
        matchId: m.id,
        userId: partner.id,
        username: partner.username,
        profilePhotoUrl: partner.profilePhotoUrl,
        compatibilityScore: m.compatibilityScore,
        matchedAt: m.matchedAt!.toISOString(),
      }
    })
  }
}
