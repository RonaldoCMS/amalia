import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from './user.entity'
import { DuelRound } from './duel-round.entity'

@Entity('duels')
export class Duel {
  @PrimaryGeneratedColumn('uuid') id: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user1Id' })
  user1: User
  @Column() user1Id: string

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user2Id' })
  user2: User | null
  @Column({ nullable: true }) user2Id: string | null

  @Column({ default: 'waiting' }) status: string

  @Column({ nullable: true }) language: string | null

  @Column({ type: 'int', default: 0 }) user1TotalScore: number
  @Column({ type: 'int', default: 0 }) user2TotalScore: number

  @Column({ nullable: true }) winnerId: string | null

  @Column({ type: 'int', default: 0 }) currentRound: number
  @Column({ type: 'int', default: 24 }) totalRounds: number
  @Column({ default: false }) isSuddenDeath: boolean

  @Column({ default: false }) isForfeit: boolean

  @Column({ type: 'int', default: 0 }) user1ConsecTimeouts: number
  @Column({ type: 'int', default: 0 }) user2ConsecTimeouts: number

  @Column({ nullable: true }) invitedUserId: string | null

  @Column({ nullable: true }) chatMatchId: string | null

  @OneToMany(() => DuelRound, r => r.duel, { cascade: true })
  rounds: DuelRound[]

  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date
}
