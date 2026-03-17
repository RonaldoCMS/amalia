import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DuelRound } from 'src/entities/duel-round.entity'

@Injectable()
export class DuelRoundRepository {
  constructor(
    @InjectRepository(DuelRound)
    private readonly repo: Repository<DuelRound>,
  ) {}

  async saveMany(rounds: Partial<DuelRound>[]): Promise<DuelRound[]> {
    return this.repo.save(rounds)
  }

  async save(round: Partial<DuelRound>): Promise<DuelRound> {
    return this.repo.save(round)
  }

  async findByDuelAndRound(duelId: string, roundNumber: number): Promise<DuelRound | null> {
    return this.repo.findOne({
      where: { duelId, roundNumber },
      relations: ['challenge'],
    })
  }

  async update(id: string, data: Partial<DuelRound>): Promise<void> {
    await this.repo.update(id, data)
  }
}
