import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { UserChallenge } from './user-challenge.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  username: string

  @Column()
  password: string

  @CreateDateColumn()
  createdAt: Date

  @OneToMany(() => UserChallenge, userChallenge => userChallenge.user)
  userChallenges: UserChallenge[]
}