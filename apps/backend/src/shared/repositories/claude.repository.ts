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
    const response = await this.client.post('/messages', {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    return response.data.content
      .map((b: { type: string; text: string }) => b.text ?? '')
      .join('')
  }
}