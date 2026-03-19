import { BadRequestException, Injectable } from '@nestjs/common';
import { CvRepository } from '../../shared/repositories/pg/cv.repository';
import { UserRepository } from '../../shared/repositories/pg/user.repository';
import { UserChallengeRepository } from '../../shared/repositories/pg/user-challenge.repository';
import { ClaudeRepository } from '../../shared/repositories/claude.repository';
import { CvAmaliaStats, CvMessage, CvSession } from '@amalia/shared';
import { computeBadges } from '../cv.badges';

@Injectable()
export class StartInterviewUseCase {
  constructor(
    private readonly cvRepository: CvRepository,
    private readonly userRepository: UserRepository,
    private readonly userChallengeRepository: UserChallengeRepository,
    private readonly claudeRepository: ClaudeRepository,
  ) {}

  async execute(userId: string): Promise<CvSession> {
    try {
      // Return existing session (any status) so users can resume or view their CV
      const existing = await this.cvRepository.findByUserId(userId);
      if (existing) return toSession(existing);

      const user = await this.userRepository.findById(userId);
      if (!user) throw new BadRequestException('Utente non trovato');

      const stats = await this.userChallengeRepository.getStats(userId);
      const history = await this.userChallengeRepository.getHistory(userId);

      // Compute top languages from correctly solved challenges
      const langCount: Record<string, number> = {};
      for (const h of history) {
        if (h.correct) {
          langCount[h.challenge.language] =
            (langCount[h.challenge.language] ?? 0) + 1;
        }
      }
      const topLanguages = Object.entries(langCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([lang]) => lang);

      const total = stats.correctCount + stats.wrongCount;
      const accuracy =
        total > 0 ? Math.round((stats.correctCount / total) * 100) : 0;

      const amaliaStats: CvAmaliaStats = {
        challengesCompleted: total,
        accuracy,
        totalScore: stats.totalScore,
        topLanguages,
        badges: computeBadges(
          stats.correctCount,
          stats.wrongCount,
          stats.totalScore,
        ),
      };

      const onboarding = user.onboarding;
      const jobType = onboarding?.jobType ?? 'Developer';
      const yearsOfExp = onboarding?.yearsOfExperience ?? 'N/D';
      const githubUrl = onboarding?.githubUrl ?? null;

      const firstContent = await this.claudeRepository.sendMessage(
        this.buildFirstMessagePrompt(
          user.username,
          amaliaStats,
          jobType,
          yearsOfExp,
          githubUrl,
        ),
        'START',
      );

      const firstMessage: CvMessage = { role: 'amalia', content: firstContent };
      const cv = await this.cvRepository.create(
        userId,
        user.username,
        firstMessage,
        amaliaStats,
      );
      return toSession(cv);
    } catch (error) {
      console.error('Error in StartInterviewUseCase:', error);
      throw new BadRequestException("Errore durante l'avvio dell'intervista");
    }
  }

  private buildFirstMessagePrompt(
    username: string,
    stats: CvAmaliaStats,
    jobType: string,
    exp: string,
    githubUrl: string | null,
  ): string {
    const langList = stats.topLanguages.join(', ') || 'non registrati';
    return `Sei Amalia, l'AI assistente della piattaforma di sfide di programmazione Amalia.
Stai per avviare una breve intervista a ${username} per creare il suo CV professionale.

DATI DELL'UTENTE (dalla piattaforma Amalia):
- Ruolo: ${jobType}
- Anni di esperienza: ${exp}
- Sfide completate: ${stats.challengesCompleted} (accuratezza ${stats.accuracy}%)
- Punteggio totale: ${stats.totalScore} punti
- Linguaggi principali: ${langList}${githubUrl ? `\n- GitHub: ${githubUrl}` : ''}

COMPITO: Avvia l'intervista.
1. Saluta ${username} per nome con calore
2. Menziona 1-2 dati dalla piattaforma per personalizzare (es. sfide, linguaggi, ruolo)
3. Spiega in UNA frase che condurrai 7 brevi domande per costruire il suo CV professionale
4. Poni subito la PRIMA domanda: come si presenterebbe a un recruiter in 2-3 frasi?

Formato: testo semplice, massimo 5 righe, italiano, tono professionale ma amichevole.`;
  }
}

export function toSession(cv: any): CvSession {
  return {
    id: cv.id,
    username: cv.username,
    status: cv.status as any,
    messages: cv.messages,
    cvData: cv.cvData ?? null,
    amaliaStats: cv.amaliaStats ?? null,
    isPublic: cv.isPublic,
    createdAt:
      cv.createdAt instanceof Date ? cv.createdAt.toISOString() : cv.createdAt,
  };
}
