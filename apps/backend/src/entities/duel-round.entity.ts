import {
  Column, Entity, JoinColumn,
  ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm'
import { Duel } from './duel.entity'
import { Challenge } from './challenge.entity'

@Entity('duel_rounds')
export class DuelRound {
  @PrimaryGeneratedColumn('uuid') id: string

  @ManyToOne(() => Duel, d => d.rounds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'duelId' })
  duel: Duel
  @Column() duelId: string

  @ManyToOne(() => Challenge, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'challengeId' })
  challenge: Challenge
  @Column() challengeId: string

  @Column({ type: 'int' }) roundNumber: number

  @Column({ type: 'text', nullable: true }) user1Answer: string | null
  @Column({ type: 'text', nullable: true }) user2Answer: string | null

  @Column({ type: 'boolean', nullable: true }) user1Correct: boolean | null
  @Column({ type: 'boolean', nullable: true }) user2Correct: boolean | null

  @Column({ type: 'int', nullable: true }) user1Score: number | null
  @Column({ type: 'int', nullable: true }) user2Score: number | null

  @Column({ type: 'timestamptz', nullable: true }) startedAt: Date | null
  @Column({ type: 'timestamptz', nullable: true }) user1AnsweredAt: Date | null
  @Column({ type: 'timestamptz', nullable: true }) user2AnsweredAt: Date | null
}
