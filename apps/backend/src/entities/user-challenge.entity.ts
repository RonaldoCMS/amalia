import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'
import { Challenge } from './challenge.entity'

@Entity('user_challenges')
export class UserChallenge {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, user => user.userChallenges)
  user: User

  @ManyToOne(() => Challenge, challenge => challenge.userChallenges)
  challenge: Challenge

  @CreateDateColumn()
  createdAt: Date
}