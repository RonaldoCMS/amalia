import { Injectable, NotFoundException } from '@nestjs/common'
import { CvRepository } from '../../shared/repositories/pg/cv.repository'
import { UserChallengeRepository } from '../../shared/repositories/pg/user-challenge.repository'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { ClaudeRepository } from '../../shared/repositories/claude.repository'
import { CvData, CvSession, CvSkill } from '@amalia/shared'
import { toSession } from './start-interview.usecase'
import { computeBadges } from '../cv.badges'

@Injectable()
export class GenerateCvUseCase {
  constructor(
    private readonly cvRepository: CvRepository,
    private readonly userChallengeRepository: UserChallengeRepository,
    private readonly userRepository: UserRepository,
    private readonly claudeRepository: ClaudeRepository,
  ) {}

  async execute(cvId: string, userId: string): Promise<CvSession> {
    const cv = await this.cvRepository.findByUserId(userId)
    if (!cv || cv.id !== cvId) throw new NotFoundException('Sessione CV non trovata')

    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundException('Utente non trovato')

    const stats = await this.userChallengeRepository.getStats(userId)
    const history = await this.userChallengeRepository.getHistory(userId)

    // Build verified languages from challenge history
    const verifiedLangs = new Set<string>()
    const langCount: Record<string, number> = {}
    for (const h of history) {
      if (h.correct) {
        verifiedLangs.add(h.challenge.language)
        langCount[h.challenge.language] = (langCount[h.challenge.language] ?? 0) + 1
      }
    }
    const topLanguages = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([lang]) => lang)

    const total = stats.correctCount + stats.wrongCount
    const accuracy = total > 0 ? Math.round((stats.correctCount / total) * 100) : 0

    const onboarding = user.onboarding
    const conversation = cv.messages
      .map(m => `${m.role === 'amalia' ? 'Amalia' : user.username}: ${m.content}`)
      .join('\n\n')

    let cvData: CvData
    try {
      const raw = await this.claudeRepository.sendMessage(
        this.buildGeneratePrompt(
          user.username,
          conversation,
          verifiedLangs,
          stats,
          total,
          accuracy,
          topLanguages,
          onboarding,
        ),
        'GENERATE_CV',
        2048,
      )
      cvData = this.parseCvData(raw, user.username, onboarding?.githubUrl ?? null)
    } catch {
      await this.cvRepository.updateStatus(cvId, 'error')
      throw new Error('Generazione CV fallita. Riprova.')
    }

    const updatedStats = {
      ...cv.amaliaStats,
      challengesCompleted: total,
      accuracy,
      totalScore: stats.totalScore,
      topLanguages,
      badges: computeBadges(stats.correctCount, stats.wrongCount, stats.totalScore),
    }

    await this.cvRepository.updateCvData(cvId, cvData, updatedStats)

    const updated = await this.cvRepository.findByUserId(userId)
    return toSession(updated!)
  }

  private buildGeneratePrompt(
    username: string,
    conversation: string,
    verifiedLangs: Set<string>,
    stats: any,
    total: number,
    accuracy: number,
    topLanguages: string[],
    onboarding: any,
  ): string {
    const verifiedList = [...verifiedLangs].join(', ') || 'nessuno'
    return `Sei Amalia, AI della piattaforma di sfide di programmazione Amalia.
Hai appena concluso un'intervista dettagliata con ${username} per creare il suo CV professionale.

=== TRASCRIZIONE INTERVISTA ===
${conversation}

=== DATI CERTIFICATI DALLA PIATTAFORMA AMALIA ===
- Sfide completate: ${total} (accuratezza ${accuracy}%)
- Punteggio totale: ${stats.totalScore} punti
- Linguaggi verificati dalla piattaforma: ${verifiedList}
- Ruolo dichiarato: ${onboarding?.jobType ?? 'non specificato'}
- Anni di esperienza: ${onboarding?.yearsOfExperience ?? 'non specificato'}
- Obiettivi: ${(onboarding?.goals ?? []).join(', ') || 'non specificati'}
- GitHub: ${onboarding?.githubUrl ?? 'non specificato'}

Genera il CV professionale di ${username} come JSON puro (ZERO testo extra, ZERO markdown):
{
  "name": "${username}",
  "title": "titolo professionale preciso in max 5 parole (es. 'Full Stack Developer TypeScript')",
  "bio": "bio professionale in prima persona, 2-3 frasi coinvolgenti che sintetizzano chi è e cosa cerca",
  "email": null,
  "githubUrl": "${onboarding?.githubUrl ?? null}",
  "education": "titolo di studio o certificazioni rilevanti, stringa unica (es. 'Laurea Informatica - Università di Bologna, 2022') o null se non menzionato",
  "skills": [
    {"name": "NomeSkill", "verified": true_o_false, "level": "Base|Intermedio|Avanzato|Expert"}
  ],
  "softSkills": ["soft skill 1", "soft skill 2", "soft skill 3"],
  "projects": [
    {"name": "Nome progetto", "description": "descrizione 1-2 frasi con impatto concreto", "technologies": ["Tech1", "Tech2"]}
  ],
  "experience": [
    {"title": "Titolo ruolo", "company": "Nome azienda o Freelance", "period": "anno-anno o anno-presente", "description": "responsabilità e risultati in 1-2 frasi"}
  ]
}

REGOLE ASSOLUTE:
- "verified": true SOLO per linguaggi in: [${verifiedList}]
- "softSkills": estrai dalle risposte dell'intervista, 3-5 soft skill concrete (es. problem solving, comunicazione, autonomia, attenzione al dettaglio)
- "education": null se non menzionato esplicitamente
- bio deve riflettere il tono e gli obiettivi dell'utente, in prima persona
- Includi TUTTE le esperienze e i progetti citati nell'intervista, anche brevemente
- Se una sezione non ha dati → array vuoto []
- JSON valido, nessun testo extra, nessun blocco markdown`
  }

  private parseCvData(raw: string, username: string, githubUrl: string | null): CvData {
    const clean = raw.replace(/```json|```/g, '').trim()
    try {
      const parsed = JSON.parse(clean) as CvData
      // Ensure required fields
      parsed.name = parsed.name || username
      parsed.title = parsed.title || 'Software Developer'
      parsed.bio = parsed.bio || ''
      parsed.email = parsed.email ?? null
      parsed.githubUrl = parsed.githubUrl ?? githubUrl
      parsed.education = parsed.education ?? null
      parsed.softSkills = parsed.softSkills ?? []
      parsed.skills = parsed.skills ?? []
      parsed.projects = parsed.projects ?? []
      parsed.experience = parsed.experience ?? []
      return parsed
    } catch {
      throw new Error(`CV JSON non parsabile: ${raw.slice(0, 200)}`)
    }
  }
}

