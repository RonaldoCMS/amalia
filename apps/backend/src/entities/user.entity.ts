import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserChallenge } from './user-challenge.entity'
import { UserOnboarding } from './user-onboarding.entity'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  username: string

  @Column()
  password: string

  @Column({ unique: true, nullable: true })
  email: string | null

  @Column({ nullable: true })
  profilePhotoUrl: string | null

  @Column({ type: 'timestamptz', nullable: true })
  duelBanUntil: Date | null

  @CreateDateColumn()
  createdAt: Date

  @OneToMany(() => UserChallenge, userChallenge => userChallenge.user)
  userChallenges: UserChallenge[]

  @OneToOne(() => UserOnboarding, onboarding => onboarding.user)
  onboarding: UserOnboarding
}