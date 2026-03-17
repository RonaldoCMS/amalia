import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AppConfig } from '../../../entities/app-config.entity'

@Injectable()
export class AppConfigRepository {
  constructor(
    @InjectRepository(AppConfig)
    private readonly repo: Repository<AppConfig>,
  ) {}

  async get(key: string): Promise<string | null> {
    const row = await this.repo.findOneBy({ key })
    return row?.value ?? null
  }

  async getNumber(key: string, fallback: number): Promise<number> {
    const val = await this.get(key)
    if (val === null) return fallback
    const n = Number(val)
    return isNaN(n) ? fallback : n
  }

  async set(key: string, value: string): Promise<void> {
    await this.repo.upsert({ key, value }, ['key'])
  }

  async seed(defaults: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(defaults)) {
      const existing = await this.repo.findOneBy({ key })
      if (!existing) await this.repo.save({ key, value })
    }
  }
}
