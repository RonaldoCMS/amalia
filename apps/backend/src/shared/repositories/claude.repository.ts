import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'

@Injectable()
export class ClaudeRepository {
  private readonly client: AxiosInstance

  constructor(private readonly configService: ConfigService) {
    const apiKey = (this.configService.get<string>('ANTHROPIC_API_KEY') ?? '').trim()
    console.log('Claude API key length:', apiKey.length, '| starts with:', apiKey.slice(0, 12))
    this.client = axios.create({
      baseURL: 'https://api.anthropic.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    })
  }

  async sendMessage(systemPrompt: string, userPrompt: string, maxTokens = 512): Promise<string> {
    return this.sendConversation(systemPrompt, [{ role: 'user', content: userPrompt }], maxTokens)
  }

  async sendConversation(
    systemPrompt: string,
    messages: { role: 'user' | 'assistant'; content: string }[],
    maxTokens = 512,
  ): Promise<string> {
    const MAX_RETRIES = 3
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log('[Claude] sendConversation roles:', messages.map(m => m.role))
        const response = await this.client.post('/messages', {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: maxTokens,
          system: systemPrompt,
          messages,
        })
        return response.data.content
          .map((b: { type: string; text: string }) => b.text ?? '')
          .join('')
      } catch (err: any) {
        if (err?.response?.status === 429 && attempt < MAX_RETRIES - 1) {
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
          continue
        }
        throw err
      }
    }
    throw new Error('Claude API: max retries exceeded')
  }
}
