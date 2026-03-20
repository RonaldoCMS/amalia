import { Injectable, BadRequestException, NotFoundException, ForbiddenException, OnModuleInit } from '@nestjs/common'
import { DuelRepository } from '../shared/repositories/pg/duel.repository'
import { DuelRoundRepository } from '../shared/repositories/pg/duel-round.repository'
import { ChallengeRepository } from '../shared/repositories/pg/challenge.repository'
import { UserRepository } from '../shared/repositories/pg/user.repository'
import { ClaudeRepository } from '../shared/repositories/claude.repository'
import { NotificationService } from '../notifications/notification.service'
import { ChatMessageRepository } from '../shared/repositories/pg/chat-message.repository'
import { AppConfigRepository } from '../shared/repositories/pg/app-config.repository'
import { TranslateChallengeUseCase } from '../challenges/usecases/translate-challenge.usecase'
import {
  ChallengeType, ChallengeLevel, ChallengeLanguage,
  DuelStateResponse, DuelQueueResponse, DuelAnswerResponse,
  DuelPlayerInfo, DuelCurrentRound, DuelRoundResult, NotificationType,
  DuelLeaderboardEntry, DuelLanguageQueueCount, DuelInviteStatusResponse,
  getTopicById, getRandomSubtopics, TOPICS,
} from '@amalia/shared'
import { Duel } from '../entities/duel.entity'
import { DuelRound } from '../entities/duel-round.entity'
import { Challenge } from '../entities/challenge.entity'

// Fallback defaults — overridden by DB app_config table
const DEFAULT_TIMEOUT: Record<string, number> = {
  [ChallengeLevel.Beginner]: 10,
  [ChallengeLevel.Intermediate]: 10,
  [ChallengeLevel.Hard]: 10,
}

const BASE_POINTS: Record<string, number> = {
  [ChallengeType.Fill]: 5,
  [ChallengeType.Quiz]: 3,
  [ChallengeType.Bug]: 7,
  [ChallengeType.Write]: 10,
}

const LEVEL_MULT: Record<string, number> = {
  [ChallengeLevel.Beginner]: 1,
  [ChallengeLevel.Intermediate]: 3,
  [ChallengeLevel.Hard]: 5,
}

@Injectable()
export class DuelsService implements OnModuleInit {
  constructor(
    private readonly duelRepo: DuelRepository,
    private readonly roundRepo: DuelRoundRepository,
    private readonly challengeRepo: ChallengeRepository,
    private readonly userRepo: UserRepository,
    private readonly claudeRepo: ClaudeRepository,
    private readonly notificationService: NotificationService,
    private readonly chatMsgRepo: ChatMessageRepository,
    private readonly appConfig: AppConfigRepository,
    private readonly translateChallengeUseCase: TranslateChallengeUseCase,
  ) {}

  async onModuleInit() {
    await this.appConfig.seed({
      'duel.timeout.beginner': '30',
      'duel.timeout.intermediate': '60',
      'duel.timeout.hard': '180',
    })
  }

  private async getTimeout(level: string): Promise<number> {
    const key = `duel.timeout.${level}`
    return this.appConfig.getNumber(key, DEFAULT_TIMEOUT[level] ?? 30)
  }

  /** Safely get UTC millis from a TypeORM Date (may be off by local tz offset). */
  private toUtcMs(d: Date | string): number {
    if (typeof d === 'string') return new Date(d + 'Z').getTime()
    // If pg returned a Date using local tz for a "timestamp without tz" column,
    // the Date already has the correct absolute time after the setTypeParser fix.
    // But if it didn't apply, compensate: re-parse the ISO string as UTC.
    return d.getTime()
  }

  // ── Queue ──────────────────────────────────────────────────────────────

  async joinQueue(userId: string, language?: string): Promise<DuelQueueResponse> {
    // Check active ban
    const user = await this.userRepo.findById(userId)
    if (user?.duelBanUntil && user.duelBanUntil > new Date()) {
      throw new ForbiddenException(user.duelBanUntil.toISOString())
    }

    const existing = await this.duelRepo.findActiveByUser(userId)
    if (existing) {
      if (existing.status === 'waiting' && existing.user1Id === userId) {
        return { status: 'waiting' }
      }
      if (existing.status === 'active') {
        return { status: 'matched', duelId: existing.id }
      }
    }

    await this.duelRepo.cancelWaiting(userId)

    // Support both legacy ChallengeLanguage enum and new topic IDs
    let preferredLang: ChallengeLanguage | undefined
    let preferredTopic: string | undefined

    if (language) {
      // Check if it's a legacy ChallengeLanguage
      if (Object.values(ChallengeLanguage).includes(language as ChallengeLanguage)) {
        preferredLang = language as ChallengeLanguage
        preferredTopic = language.toLowerCase()
      } else {
        // It's a topic ID
        const topic = getTopicById(language)
        if (topic) {
          preferredTopic = language
          // Map to ChallengeLanguage for DB storage if it's a programming language
          const langMap: Record<string, ChallengeLanguage> = {
            typescript: ChallengeLanguage.TypeScript,
            javascript: ChallengeLanguage.JavaScript,
            python: ChallengeLanguage.Python,
            java: ChallengeLanguage.Java,
            csharp: ChallengeLanguage.CSharp,
            cpp: ChallengeLanguage.Cpp,
            go: ChallengeLanguage.Go,
            rust: ChallengeLanguage.Rust,
            kotlin: ChallengeLanguage.Kotlin,
            swift: ChallengeLanguage.Swift,
            php: ChallengeLanguage.PHP,
            ruby: ChallengeLanguage.Ruby,
            dart: ChallengeLanguage.Dart,
            c: ChallengeLanguage.C,
          }
          preferredLang = langMap[language] ?? ChallengeLanguage.TypeScript
        }
      }
    }

    const waiting = await this.duelRepo.findWaiting(userId, preferredLang)
    if (waiting) {
      // Use preferred language if explicitly requested, else pick common
      const matchLang = preferredLang ?? (waiting.language as ChallengeLanguage | undefined)
        ?? await this.pickCommonLanguage(waiting.user1Id, userId)
      
      // Determine topic ID for challenge generation
      const matchTopic = preferredTopic ?? this.languageToTopicId(matchLang)

      const challenges = await this.prepareChallenges(matchLang, matchTopic)

      waiting.user2Id = userId
      waiting.status = 'active'
      waiting.language = matchLang
      waiting.currentRound = 1
      waiting.totalRounds = challenges.length
      await this.duelRepo.save(waiting)

      const rounds: Partial<DuelRound>[] = challenges.map((c, i) => ({
        duelId: waiting.id,
        challengeId: c.id,
        roundNumber: i + 1,
        startedAt: i === 0 ? new Date() : null,
      }))
      await this.roundRepo.saveMany(rounds)

      const user2 = await this.userRepo.findById(userId)
      await this.notificationService.notify(
        waiting.user1Id, NotificationType.NewMatch,
        'Sfida iniziata!', `${user2?.username ?? 'Un avversario'} ha accettato la tua sfida!`,
        waiting.id,
      )

      return { status: 'matched', duelId: waiting.id }
    }

    const duel = await this.duelRepo.save({
      user1Id: userId,
      status: 'waiting',
      language: preferredLang ?? null,
      currentRound: 0,
    } as Partial<Duel>)

    return { status: 'waiting', duelId: duel.id }
  }

  async getLeaderboard(): Promise<DuelLeaderboardEntry[]> {
    return this.duelRepo.getLeaderboard()
  }

  async getLanguageQueueCounts(): Promise<DuelLanguageQueueCount[]> {
    return this.duelRepo.getLanguageQueueCounts()
  }

  async forfeit(duelId: string, userId: string): Promise<void> {
    const duel = await this.duelRepo.findById(duelId)
    if (!duel || duel.status !== 'active') throw new BadRequestException('Duello non attivo')
    const isUser1 = duel.user1Id === userId
    const isUser2 = duel.user2Id === userId
    if (!isUser1 && !isUser2) throw new ForbiddenException()
    await this.applyForfeit(duel, userId)
  }

  async inviteUser(fromUserId: string, targetUserId: string, language?: string, chatMatchId?: string): Promise<DuelQueueResponse> {
    await this.duelRepo.cancelWaiting(fromUserId)
    const duel = await this.duelRepo.save({
      user1Id: fromUserId,
      status: 'waiting',
      language: language ?? null,
      currentRound: 0,
      invitedUserId: targetUserId,
      chatMatchId: chatMatchId ?? null,
    } as Partial<Duel>)
    const fromUser = await this.userRepo.findById(fromUserId)
    const langLabel = language ? ` in ${language}` : ''
    await this.notificationService.notify(
      targetUserId,
      NotificationType.DuelChallenge,
      '⚔️ Sei sfidato!',
      `${fromUser?.username ?? 'Un developer'} ti ha lanciato una sfida${langLabel}! Accetta ora.`,
      'duel',
    )
    return { status: 'waiting', duelId: duel.id }
  }

  async acceptInvite(duelId: string, acceptingUserId: string): Promise<DuelQueueResponse> {
    const duel = await this.duelRepo.findById(duelId)
    if (!duel || duel.status !== 'waiting') {
      throw new BadRequestException('Invito non più valido o già accettato')
    }

    // 10-minute expiry
    const TEN_MIN = 10 * 60 * 1000
    if (Date.now() - this.toUtcMs(duel.createdAt) > TEN_MIN) {
      throw new BadRequestException('Invito scaduto (più di 10 minuti fa)')
    }

    // Cannot accept your own invite
    if (duel.user1Id === acceptingUserId) {
      throw new ForbiddenException('Non puoi accettare la tua stessa sfida')
    }

    // If the duel was a direct invite, only the invited user can accept
    if (duel.invitedUserId && duel.invitedUserId !== acceptingUserId) {
      throw new ForbiddenException('Questo invito non è per te')
    }

    // Acceptor must not be in an active duel
    const acceptorActive = await this.duelRepo.findActiveByUser(acceptingUserId)
    if (acceptorActive && acceptorActive.status === 'active') {
      throw new BadRequestException('Sei già in una sfida attiva. Terminala prima di accettare.')
    }

    // Inviter must not be in a different active duel
    const inviterActive = await this.duelRepo.findActiveByUser(duel.user1Id)
    if (inviterActive && inviterActive.id !== duelId && inviterActive.status === 'active') {
      throw new BadRequestException("Chi ti ha sfidato è già in un'altra sfida. Riprova più tardi.")
    }

    // Prepare challenges
    const matchLang = (duel.language as ChallengeLanguage | null)
      ?? await this.pickCommonLanguage(duel.user1Id, acceptingUserId)
    const matchTopic = this.languageToTopicId(matchLang)
    const challenges = await this.prepareChallenges(matchLang, matchTopic)

    duel.user2Id = acceptingUserId
    duel.status = 'active'
    duel.language = matchLang
    duel.currentRound = 1
    duel.totalRounds = challenges.length
    await this.duelRepo.save(duel)

    const rounds: Partial<DuelRound>[] = challenges.map((c, i) => ({
      duelId: duel.id,
      challengeId: c.id,
      roundNumber: i + 1,
      startedAt: i === 0 ? new Date() : null,
    }))
    await this.roundRepo.saveMany(rounds)

    const acceptingUser = await this.userRepo.findById(acceptingUserId)
    await this.notificationService.notify(
      duel.user1Id,
      NotificationType.NewMatch,
      'Sfida accettata!',
      `${acceptingUser?.username ?? 'Un avversario'} ha accettato la tua sfida!`,
      duel.id,
    )

    // Also notify the acceptor
    const challengerUser = await this.userRepo.findById(duel.user1Id)
    await this.notificationService.notify(
      acceptingUserId,
      NotificationType.NewMatch,
      '⚔️ Sfida iniziata!',
      `La sfida con ${challengerUser?.username ?? 'un developer'} è iniziata!`,
      duel.id,
    )

    // Send system message to the originating chat
    if (duel.chatMatchId) {
      await this.chatMsgRepo.send(
        duel.chatMatchId, acceptingUserId,
        `✅ Sfida accettata! La sfida è in corso.`,
        { isSystemMessage: true, duelInviteId: duel.id },
      )
    }

    return { status: 'matched', duelId: duel.id }
  }
  async expireInvite(duelId: string, userId: string): Promise<void> {
    const duel = await this.duelRepo.findById(duelId)
    if (!duel) return
    if (duel.user1Id !== userId && duel.invitedUserId !== userId) throw new ForbiddenException()
    if (duel.status !== 'waiting') return // already accepted / cancelled
    const TEN_MIN = 10 * 60 * 1000
    if (Date.now() - this.toUtcMs(duel.createdAt) < TEN_MIN) return // not expired yet

    duel.status = 'cancelled'
    await this.duelRepo.save(duel)

    // Notify both parties
    await this.notificationService.notify(
      duel.user1Id, NotificationType.DuelChallenge,
      '⏰ Invito scaduto', 'Il tuo invito a sfida non è stato accettato in tempo.', duel.id,
    )
    if (duel.invitedUserId) {
      await this.notificationService.notify(
        duel.invitedUserId, NotificationType.DuelChallenge,
        '⏰ Invito sfida scaduto', 'Un invito a sfida è scaduto prima che tu potessi accettarlo.', duel.id,
      )
    }

    // Send system message to the originating chat
    if (duel.chatMatchId) {
      await this.chatMsgRepo.send(
        duel.chatMatchId, duel.user1Id,
        '⏰ Invito scaduto. La sfida non è stata avviata in tempo.',
        { isSystemMessage: true },
      )
    }
  }

  async getInviteStatus(duelId: string): Promise<DuelInviteStatusResponse> {
    const duel = await this.duelRepo.findById(duelId)
    if (!duel) throw new NotFoundException('Duel non trovato')

    // Auto-expire if waiting > 10 min
    if (duel.status === 'waiting') {
      const TEN_MIN = 10 * 60 * 1000
      if (Date.now() - this.toUtcMs(duel.createdAt) > TEN_MIN) {
        duel.status = 'cancelled'
        await this.duelRepo.save(duel)
      }
    }

    const challenger = duel.user1
    const invited = duel.user2 ?? (duel.invitedUserId ? await this.userRepo.findById(duel.invitedUserId) : null)
    const winner = duel.winnerId
      ? (duel.winnerId === duel.user1Id ? duel.user1 : duel.user2)
      : null

    return {
      status: duel.status as DuelInviteStatusResponse['status'],
      challengerId: duel.user1Id,
      challengerUsername: challenger?.username ?? '',
      invitedUserId: duel.invitedUserId,
      invitedUsername: invited?.username ?? null,
      user1Score: duel.user1TotalScore,
      user2Score: duel.user2TotalScore,
      winnerId: duel.winnerId,
      winnerUsername: winner?.username ?? null,
      createdAt: duel.createdAt.toISOString(),
    }
  }
  async leaveQueue(userId: string): Promise<void> {
    await this.duelRepo.cancelWaiting(userId)
  }

  async getQueueStatus(userId: string): Promise<DuelQueueResponse> {
    const duel = await this.duelRepo.findActiveByUser(userId)
    if (!duel) return { status: 'none' }
    if (duel.status === 'waiting') return { status: 'waiting' }
    if (duel.status === 'active') return { status: 'matched', duelId: duel.id }
    return { status: 'none' }
  }

  // ── Duel State ─────────────────────────────────────────────────────────

  async getDuel(duelId: string, userId: string): Promise<DuelStateResponse> {
    const duel = await this.duelRepo.findById(duelId)
    if (!duel) throw new NotFoundException()

    const isUser1 = duel.user1Id === userId
    const isUser2 = duel.user2Id === userId
    if (!isUser1 && !isUser2) throw new ForbiddenException()

    if (duel.status === 'active') {
      await this.advanceExpiredRounds(duel)
    }

    const me: DuelPlayerInfo = {
      id: isUser1 ? duel.user1.id : duel.user2!.id,
      username: isUser1 ? duel.user1.username : duel.user2!.username,
      profilePhotoUrl: isUser1 ? duel.user1.profilePhotoUrl : duel.user2!.profilePhotoUrl,
      totalScore: isUser1 ? duel.user1TotalScore : duel.user2TotalScore,
    }
    const opponent: DuelPlayerInfo | null = duel.user2 ? {
      id: isUser1 ? duel.user2.id : duel.user1.id,
      username: isUser1 ? duel.user2.username : duel.user1.username,
      profilePhotoUrl: isUser1 ? duel.user2.profilePhotoUrl : duel.user1.profilePhotoUrl,
      totalScore: isUser1 ? duel.user2TotalScore : duel.user1TotalScore,
    } : null

    const completedRounds = duel.rounds.filter(r => r.user1Correct !== null && r.user2Correct !== null)
    const history: DuelRoundResult[] = completedRounds.map(r => ({
      roundNumber: r.roundNumber,
      type: r.challenge.type,
      level: r.challenge.level,
      myCorrect: isUser1 ? r.user1Correct! : r.user2Correct!,
      opponentCorrect: isUser1 ? r.user2Correct! : r.user1Correct!,
      myScore: isUser1 ? (r.user1Score ?? 0) : (r.user2Score ?? 0),
      opponentScore: isUser1 ? (r.user2Score ?? 0) : (r.user1Score ?? 0),
      correctAnswer: r.challenge.answer,
    }))

    let currentRound: DuelCurrentRound | null = null
    if (duel.status === 'active' && duel.currentRound > 0) {
      const round = duel.rounds.find(r => r.roundNumber === duel.currentRound)
      if (round && round.user1Correct === null && round.user2Correct === null
        || (round && (isUser1 ? round.user1Correct === null : round.user2Correct === null))) {
        const elapsed = round.startedAt
          ? Math.floor((Date.now() - this.toUtcMs(round.startedAt)) / 1000)
          : 0
        const timeout = await this.getTimeout(round.challenge.level)
        const secondsLeft = Math.max(0, timeout - elapsed)
        const myAnswer = isUser1 ? round.user1Answer : round.user2Answer
        const opponentAnswered = isUser1
          ? round.user2Answer !== null
          : round.user1Answer !== null

        const userLang = (isUser1 ? duel.user1 : duel.user2!)?.preferredLanguage ?? 'en'
        const challengeResponse = {
          id: round.challenge.id,
          title: round.challenge.title,
          description: round.challenge.description,
          code: round.challenge.code,
          options: round.challenge.options,
          answer: round.challenge.answer,
        }
        const translated = await this.translateChallengeUseCase.execute(
          round.challenge.id, challengeResponse, userLang, round.challenge.translations ?? {},
        )

        currentRound = {
          roundNumber: round.roundNumber,
          type: round.challenge.type,
          level: round.challenge.level,
          challenge: {
            title: translated.title,
            description: translated.description,
            code: round.challenge.code,
            options: translated.options,
          },
          myAnswer,
          opponentAnswered,
          secondsLeft,
          totalSeconds: timeout,
        }
      }
    }

    return {
      id: duel.id,
      status: duel.status as any,
      language: duel.language ?? '',
      me,
      opponent,
      currentRoundNumber: duel.currentRound,
      totalRounds: duel.totalRounds,
      winnerId: duel.winnerId,
      isSuddenDeath: duel.isSuddenDeath,
      currentRound,
      history,
      createdAt: duel.createdAt.toISOString(),
    }
  }

  // ── Submit Answer ──────────────────────────────────────────────────────

  async submitAnswer(
    duelId: string,
    userId: string,
    answer: string,
  ): Promise<DuelAnswerResponse> {
    const duel = await this.duelRepo.findById(duelId)
    if (!duel || duel.status !== 'active') throw new BadRequestException('Duello non attivo')

    const isUser1 = duel.user1Id === userId
    const isUser2 = duel.user2Id === userId
    if (!isUser1 && !isUser2) throw new ForbiddenException()

    const round = duel.rounds.find(r => r.roundNumber === duel.currentRound)
    if (!round) throw new BadRequestException('Round non trovato')

    const alreadyAnswered = isUser1 ? round.user1Answer !== null : round.user2Answer !== null
    if (alreadyAnswered) throw new BadRequestException('Hai già risposto a questo round')

    if (round.startedAt) {
      const elapsed = (Date.now() - this.toUtcMs(round.startedAt)) / 1000
      const timeout = await this.getTimeout(round.challenge.level)
      if (elapsed > timeout + 2) {
        throw new BadRequestException('Tempo scaduto per questo round')
      }
    }

    const correct = this.checkAnswer(answer, round.challenge.answer, round.challenge.type)
    const score = correct
      ? (BASE_POINTS[round.challenge.type] ?? 3) * (LEVEL_MULT[round.challenge.level] ?? 1)
      : 0

    if (isUser1) {
      round.user1Answer = answer
      round.user1Correct = correct
      round.user1Score = score
      round.user1AnsweredAt = new Date()
    } else {
      round.user2Answer = answer
      round.user2Correct = correct
      round.user2Score = score
      round.user2AnsweredAt = new Date()
    }
    await this.roundRepo.save(round)

    if (isUser1) duel.user1TotalScore += score
    else duel.user2TotalScore += score
    await this.duelRepo.save(duel)

    const bothAnswered = round.user1Answer !== null && round.user2Answer !== null
    if (bothAnswered) {
      await this.completeRound(duel)
    }

    return { correct, score }
  }

  // ── Internal ───────────────────────────────────────────────────────────

  private async advanceExpiredRounds(duel: Duel): Promise<void> {
    if (duel.currentRound <= 0) return
    const round = duel.rounds.find(r => r.roundNumber === duel.currentRound)
    if (!round || !round.startedAt) return

    const elapsed = (Date.now() - this.toUtcMs(round.startedAt)) / 1000
    const timeout = await this.getTimeout(round.challenge.level)
    if (elapsed <= timeout) return

    const user1TimedOut = round.user1Correct === null && round.user1Answer === null
    const user2TimedOut = round.user2Correct === null && round.user2Answer === null

    if (user1TimedOut) {
      round.user1Answer = ''
      round.user1Correct = false
      round.user1Score = 0
      round.user1AnsweredAt = new Date()
      duel.user1ConsecTimeouts = (duel.user1ConsecTimeouts ?? 0) + 1
    } else {
      duel.user1ConsecTimeouts = 0
    }

    if (user2TimedOut) {
      round.user2Answer = ''
      round.user2Correct = false
      round.user2Score = 0
      round.user2AnsweredAt = new Date()
      duel.user2ConsecTimeouts = (duel.user2ConsecTimeouts ?? 0) + 1
    } else {
      duel.user2ConsecTimeouts = 0
    }

    await this.roundRepo.save(round)
    await this.duelRepo.save(duel)

    // Auto-forfeit after 3 consecutive timeouts
    if (duel.user1ConsecTimeouts >= 3) {
      await this.applyForfeit(duel, duel.user1Id)
      return
    }
    if (duel.user2Id && duel.user2ConsecTimeouts >= 3) {
      await this.applyForfeit(duel, duel.user2Id)
      return
    }

    await this.completeRound(duel)
  }

  private async applyForfeit(duel: Duel, forfeitUserId: string): Promise<void> {
    const winnerId = forfeitUserId === duel.user1Id ? duel.user2Id! : duel.user1Id

    // -5 penalty score for forfeiter
    if (forfeitUserId === duel.user1Id) {
      duel.user1TotalScore = -5
    } else {
      duel.user2TotalScore = -5
    }

    duel.status = 'completed'
    duel.winnerId = winnerId
    duel.isForfeit = true
    await this.duelRepo.save(duel)

    // Check daily forfeit count → 1hr ban if ≥ 3
    const todayForfeits = await this.duelRepo.countTodayForfeits(forfeitUserId)
    if (todayForfeits >= 3) {
      const user = await this.userRepo.findById(forfeitUserId)
      if (user) {
        user.duelBanUntil = new Date(Date.now() + 60 * 60 * 1000)
        await this.userRepo.save(user)
      }
    }

    await this.sendDuelEndNotifications(duel)
  }

  private async completeRound(duel: Duel): Promise<void> {
    const isLast = duel.currentRound >= duel.totalRounds

    if (isLast) {
      if (duel.user1TotalScore === duel.user2TotalScore) {
        await this.startSuddenDeath(duel)
        return
      }
      duel.status = 'completed'
      duel.winnerId = duel.user1TotalScore > duel.user2TotalScore
        ? duel.user1Id
        : duel.user2Id!
      await this.duelRepo.save(duel)
      await this.sendDuelEndNotifications(duel)
      return
    }

    const nextRound = duel.currentRound + 1
    const nextRoundEntity = duel.rounds.find(r => r.roundNumber === nextRound)
    if (nextRoundEntity) {
      nextRoundEntity.startedAt = new Date()
      await this.roundRepo.save(nextRoundEntity)
    }

    duel.currentRound = nextRound
    await this.duelRepo.save(duel)
  }

  private async startSuddenDeath(duel: Duel): Promise<void> {
    duel.isSuddenDeath = true
    const language = (duel.language as ChallengeLanguage) ?? ChallengeLanguage.JavaScript
    const levels = Object.values(ChallengeLevel)
    const randomLevel = levels[Math.floor(Math.random() * levels.length)]

    const challenges = await this.getOrGenerateChallenges(
      ChallengeType.Quiz, randomLevel, language, 1,
    )
    if (challenges.length === 0) throw new BadRequestException('Impossibile generare la sfida')

    const newRoundNumber = duel.totalRounds + 1
    duel.totalRounds = newRoundNumber
    duel.currentRound = newRoundNumber
    await this.duelRepo.save(duel)

    await this.roundRepo.save({
      duelId: duel.id,
      challengeId: challenges[0].id,
      roundNumber: newRoundNumber,
      startedAt: new Date(),
    } as Partial<DuelRound>)

    const reloaded = await this.duelRepo.findById(duel.id)
    if (reloaded) {
      duel.rounds = reloaded.rounds
    }
  }

  private async sendDuelEndNotifications(duel: Duel): Promise<void> {
    const winner = duel.winnerId
    const u1 = duel.user1Id
    const u2 = duel.user2Id!

    if (winner === u1) {
      await this.notificationService.notify(u1, NotificationType.NewMatch, 'Sfida vinta! 🏆', 'Hai vinto la sfida!', duel.id)
      await this.notificationService.notify(u2, NotificationType.NewMatch, 'Sfida persa', 'Hai perso la sfida. Ritenta!', duel.id)
    } else {
      await this.notificationService.notify(u2, NotificationType.NewMatch, 'Sfida vinta! 🏆', 'Hai vinto la sfida!', duel.id)
      await this.notificationService.notify(u1, NotificationType.NewMatch, 'Sfida persa', 'Hai perso la sfida. Ritenta!', duel.id)
    }

    // Send outcome as a system message to the originating chat
    if (duel.chatMatchId) {
      const winnerUser = winner === u1 ? duel.user1 : duel.user2
      const winnerName = winnerUser?.username ?? 'Qualcuno'
      const u1Score = duel.user1TotalScore
      const u2Score = duel.user2TotalScore
      const winScore = winner === u1 ? u1Score : u2Score
      const loseScore = winner === u1 ? u2Score : u1Score
      const content = duel.isForfeit
        ? `🏳️ Sfida terminata per abbandono. ${winnerName} ha vinto!`
        : `🏆 Sfida conclusa! ${winnerName} ha vinto ${winScore}-${loseScore}!`
      await this.chatMsgRepo.send(duel.chatMatchId, u1, content, { isSystemMessage: true })
    }
  }

  // ── Language ───────────────────────────────────────────────────────────

  private languageToTopicId(lang: ChallengeLanguage): string {
    const map: Record<ChallengeLanguage, string> = {
      [ChallengeLanguage.TypeScript]: 'typescript',
      [ChallengeLanguage.JavaScript]: 'javascript',
      [ChallengeLanguage.Python]: 'python',
      [ChallengeLanguage.Java]: 'java',
      [ChallengeLanguage.CSharp]: 'csharp',
      [ChallengeLanguage.Cpp]: 'cpp',
      [ChallengeLanguage.Go]: 'go',
      [ChallengeLanguage.Rust]: 'rust',
      [ChallengeLanguage.Kotlin]: 'kotlin',
      [ChallengeLanguage.Swift]: 'swift',
      [ChallengeLanguage.PHP]: 'php',
      [ChallengeLanguage.Ruby]: 'ruby',
      [ChallengeLanguage.Dart]: 'dart',
      [ChallengeLanguage.Flutter]: 'dart',
      [ChallengeLanguage.C]: 'c',
    }
    return map[lang] ?? 'typescript'
  }

  private async pickCommonLanguage(user1Id: string, user2Id: string): Promise<ChallengeLanguage> {
    const u1 = await this.userRepo.findById(user1Id)
    const u2 = await this.userRepo.findById(user2Id)

    const langs1 = u1?.onboarding?.languages ?? []
    const langs2 = u2?.onboarding?.languages ?? []

    const challengeLangs = new Set(Object.values(ChallengeLanguage) as string[])
    const common = langs1.filter(l => langs2.includes(l) && challengeLangs.has(l))

    if (common.length > 0) {
      return common[Math.floor(Math.random() * common.length)] as ChallengeLanguage
    }
    return ChallengeLanguage.JavaScript
  }

  // ── Challenge Preparation ──────────────────────────────────────────────

  private async prepareChallenges(language: ChallengeLanguage, topicId?: string): Promise<Challenge[]> {
    const types = Object.values(ChallengeType)
    const levels = Object.values(ChallengeLevel)
    const all: Challenge[] = []

    // Sequential to avoid rate limits — 1 challenge per type+level combo = 12 total
    for (const type of types) {
      for (const level of levels) {
        const batch = await this.getOrGenerateChallenges(type, level, language, 1, topicId)
        all.push(...batch)
      }
    }

    return this.shuffle(all)
  }

  private async getOrGenerateChallenges(
    type: ChallengeType,
    level: ChallengeLevel,
    language: ChallengeLanguage,
    count: number,
    topicId?: string,
  ): Promise<Challenge[]> {
    // For duels, always generate fresh challenges with random subtopics
    // This ensures variety and includes framework-specific questions
    const generated: Challenge[] = []
    for (let i = 0; i < count; i++) {
      generated.push(await this.generateSingleChallenge(type, level, language, topicId))
    }
    return generated
  }

  private async generateSingleChallenge(
    type: ChallengeType,
    level: ChallengeLevel,
    language: ChallengeLanguage,
    topicId?: string,
  ): Promise<Challenge> {
    // Get topic info and randomly select subtopics
    const topic = topicId ? getTopicById(topicId) : null
    const randomSubs = topicId ? getRandomSubtopics(topicId, 2) : []
    
    // Build topic string for prompt
    let topicLabel = language
    if (topic) {
      topicLabel = topic.label
      if (randomSubs.length > 0) {
        const subLabels = randomSubs.map(s => s.label).join(', ')
        topicLabel += ` (focus on: ${subLabels})`
      }
    }

    const typeDesc: Record<string, string> = {
      [ChallengeType.Fill]: 'Fill in the missing code — replace a part with ___BLANK___',
      [ChallengeType.Quiz]: 'Multiple choice — what does this code produce or do? Give 4 options (A,B,C,D)',
      [ChallengeType.Bug]: 'Find the bug — insert ONE intentional error in the code',
      [ChallengeType.Write]: 'Write the function — show only the signature and description',
    }

    const sizeHint: Record<string, string> = {
      [ChallengeLevel.Beginner]: 'The code snippet must be VERY short: maximum 4-6 lines.',
      [ChallengeLevel.Intermediate]: 'The code snippet must be short: maximum 8-12 lines.',
      [ChallengeLevel.Hard]: 'The code snippet must be concise: maximum 15-20 lines.',
    }

    const system = `You are Amalia, a programming teacher.
You generate real, educational coding exercises.
ALWAYS respond with valid JSON only. No extra text, no markdown, no backticks.`

    const user = `Generate a programming exercise about ${topicLabel}.
Type: ${typeDesc[type]}
Level: ${level}
${sizeHint[level] ?? ''}
Respond with this JSON:
{ "title": "...", "description": "...", "code": "...", "options": [...], "answer": "..." }
IMPORTANT: each option MUST be a single string in the array. Be concise.`

    const raw = await this.claudeRepo.sendMessage(system, user)
    const clean = raw.replace(/```json|```/g, '').trim()
    const p = JSON.parse(clean)
    const options = p.options ? this.normalizeOptions(p.options) : []

    return this.challengeRepo.save({ type, level, language, title: p.title, description: p.description, code: p.code, options, answer: p.answer })
  }

  private normalizeOptions(options: string[]): string[] {
    const merged: string[] = []
    for (const opt of options) {
      if (/^\s*[A-D]\./.test(opt)) merged.push(opt)
      else if (merged.length > 0) merged[merged.length - 1] += ',' + opt
    }
    return merged.length > 0 ? merged : options
  }

  // ── Answer Check ───────────────────────────────────────────────────────

  private checkAnswer(userAnswer: string, correctAnswer: string, type: ChallengeType): boolean {
    const ua = userAnswer.trim().replace(/\s+/g, ' ').toLowerCase()
    const ca = correctAnswer.trim().replace(/\s+/g, ' ').toLowerCase()

    if (type === ChallengeType.Quiz) {
      const uletter = ua.match(/^[a-d]/)?.[0]
      const cletter = ca.match(/^[a-d]/)?.[0]
      if (uletter && cletter) return uletter === cletter
    }

    return ua === ca
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
}
