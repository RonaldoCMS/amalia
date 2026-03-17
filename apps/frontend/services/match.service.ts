import { MatchRepository } from '../repositories/match.repository'
import { MatchSuggestion, MatchItem, LikeResponse } from '@amalia/shared'

export class MatchService {
  private readonly repository: MatchRepository

  constructor() {
    this.repository = new MatchRepository()
  }

  getSuggestions(): Promise<MatchSuggestion[]> {
    return this.repository.getSuggestions()
  }

  getMatches(): Promise<MatchItem[]> {
    return this.repository.getMatches()
  }

  like(userId: string): Promise<LikeResponse> {
    return this.repository.like(userId)
  }

  archiveMatch(matchId: string): Promise<void> {
    return this.repository.archiveMatch(matchId)
  }
}
