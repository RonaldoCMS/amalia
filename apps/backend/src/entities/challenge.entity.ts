import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { UserChallenge } from './user-challenge.entity'
import { ChallengeType, ChallengeLevel, ChallengeLanguage } from '@amelia/shared'

@Entity('challenges')
export class Challenge {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'enum', enum: ChallengeType })
  type: ChallengeType

  @Column({ type: 'enum', enum: ChallengeLevel })
  level: ChallengeLevel

  @Column({ type: 'enum', enum: ChallengeLanguage })
  language: ChallengeLanguage

  @Column()
  title: string

  @Column('text')
  description: string

  @Column('text')
  code: string

  @Column('simple-array')
  options: string[]

  @Column()
  answer: string

  @CreateDateColumn()
  createdAt: Date

  @OneToMany(() => UserChallenge, userChallenge => userChallenge.challenge)
  userChallenges: UserChallenge[]
}