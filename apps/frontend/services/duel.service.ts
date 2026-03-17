import { DuelRepository } from '../repositories/duel.repository'
import {
  DuelAnswerRequest, DuelAnswerResponse, DuelQueueResponse, DuelStateResponse,
  DuelLeaderboardEntry, DuelLanguageQueueCount, DuelInviteStatusResponse,
} from '@amelia/shared'

export class DuelService {
  private readonly repo = new DuelRepository()

  joinQueue(language?: string): Promise<DuelQueueResponse> { return this.repo.joinQueue(language) }
  leaveQueue(): Promise<void> { return this.repo.leaveQueue() }
  getQueueStatus(): Promise<DuelQueueResponse> { return this.repo.getQueueStatus() }
  getDuel(id: string): Promise<DuelStateResponse> { return this.repo.getDuel(id) }
  submitAnswer(id: string, body: DuelAnswerRequest): Promise<DuelAnswerResponse> {
    return this.repo.submitAnswer(id, body)
  }
  forfeit(id: string): Promise<void> { return this.repo.forfeit(id) }
  inviteUser(targetUserId: string, language?: string, chatMatchId?: string): Promise<DuelQueueResponse> { return this.repo.inviteUser(targetUserId, language, chatMatchId) }
  acceptInvite(duelId: string): Promise<DuelQueueResponse> { return this.repo.acceptInvite(duelId) }
  getInviteStatus(duelId: string): Promise<DuelInviteStatusResponse> { return this.repo.getInviteStatus(duelId) }
  expireInvite(duelId: string): Promise<void> { return this.repo.expireInvite(duelId) }
  getLeaderboard(): Promise<DuelLeaderboardEntry[]> { return this.repo.getLeaderboard() }
  getLanguageQueueCounts(): Promise<DuelLanguageQueueCount[]> { return this.repo.getLanguageQueueCounts() }
}
