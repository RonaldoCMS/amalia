import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { CvRepository } from '../../shared/repositories/pg/cv.repository'
import { ClaudeRepository } from '../../shared/repositories/claude.repository'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { getLanguageInstruction } from '../../shared/utils/prompt-language'
import { CvMessage, CvSendMessageResponse } from '@amalia/shared'
import { toSession } from './start-interview.usecase'

const TOTAL_QUESTIONS = 7

@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly cvRepository: CvRepository,
    private readonly claudeRepository: ClaudeRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(cvId: string, userId: string, content: string): Promise<CvSendMessageResponse> {
    const cv = await this.cvRepository.findByUserId(userId)
    if (!cv || cv.id !== cvId) throw new NotFoundException('Sessione CV non trovata')
    if (cv.status !== 'interviewing') throw new BadRequestException('Intervista già completata')

    const userMessage: CvMessage = { role: 'user', content }
    const allMessages = [...cv.messages, userMessage]

    const userMessages = allMessages.filter(m => m.role === 'user')
    const isDone = userMessages.length >= TOTAL_QUESTIONS

    // Build Anthropic-format conversation
    const conversation = allMessages.map(m => ({
      role: (m.role === 'amalia' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content,
    }))

    const user = await this.userRepository.findById(userId)
    const lang = user?.preferredLanguage ?? 'it'

    const amaliaContent = await this.claudeRepository.sendConversation(
      this.buildSystemPrompt(cv.username, cv.amaliaStats, isDone, lang),
      conversation,
      350,
    )

    const amaliaMessage: CvMessage = { role: 'amalia', content: amaliaContent }

    await this.cvRepository.appendMessages(cvId, [userMessage, amaliaMessage])

    if (isDone) {
      await this.cvRepository.updateStatus(cvId, 'generating')
    }

    return { message: amaliaMessage, isDone }
  }

  private buildSystemPrompt(username: string, stats: any, isDone: boolean, lang: string): string {
    const langInstr = getLanguageInstruction(lang)
    if (isDone) {
      return `You are Amalia, AI assistant of the Amalia platform.
You have just received the last answer from ${username} in their CV interview.
Conclude the interview: thank them warmly in 1-2 sentences, then write a final sentence saying you have everything you need and are generating their professional CV, followed by 🚀.
Do NOT add anything after that sentence.${langInstr}`
    }

    const langList = stats?.topLanguages?.join(', ') || 'not specified'

    return `You are Amalia, AI assistant of the Amalia platform (programming challenges).
You are conducting an interview with ${username} to create their professional CV.

PLATFORM DATA: ${stats?.challengesCompleted ?? 0} challenges completed, ${stats?.accuracy ?? 0}% accuracy, ${stats?.totalScore ?? 0} points, main languages: ${langList}

QUESTION SEQUENCE (EXACTLY in this order, ONE at a time):
1. How would you introduce yourself to a recruiter in 2-3 sentences? (professional elevator pitch)
2. What work experiences have you had? (roles, companies, duration — including internships/freelance)
3. Do you have any relevant degrees or certifications?
4. Describe 1-2 projects you're proud of: what you did, with which technologies, what impact it had?
5. What are your main technical strengths? Which stacks or tools do you use best?
6. How would you describe yourself as a colleague? Tell me 3 soft skills that truly represent you (e.g. problem solving, communication, leadership, creativity...).
7. What are you looking for professionally right now? (full-time job, freelance, growth, career change...)

STRICT RULES:
- Look at the conversation: count the user's answers and ask the NEXT question not yet asked
- Before each answer: briefly comment on what the user said (max 1 line, vary the comment)
- NEVER ask two questions at once
- Max 4 lines total per response
- Professional but warm and human tone
- If an answer is very short or generic, gently ask for a concrete example before moving on${langInstr}`
  }
}
