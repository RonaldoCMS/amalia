import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios, { AxiosInstance } from 'axios'

@Injectable()
export class ClaudeRepository {
  private readonly client: AxiosInstance

  constructor(private readonly configService: ConfigService) {
    this.client = axios.create({
      baseURL: 'https://api.anthropic.com/v1',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.configService.get<string>('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01',
      },
    })
  }

  async sendMessage(systemPrompt: string, userPrompt: string): Promise<string> {
    const MAX_RETRIES = 3
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await this.client.post('/messages', {
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
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