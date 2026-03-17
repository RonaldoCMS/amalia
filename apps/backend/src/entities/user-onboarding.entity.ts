import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'

@Entity('user_onboarding')
export class UserOnboarding {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => User, user => user.onboarding)
  @JoinColumn()
  user: User

  @Column({ type: 'simple-array', nullable: true })
  languages: string[]

  @Column({ nullable: true })
  yearsOfExperience: string

  @Column({ nullable: true })
  jobType: string

  @Column({ type: 'simple-array', nullable: true })
  goals: string[]

  @Column({ nullable: true })
  workStyle: string

  @Column({ nullable: true })
  availability: string

  @Column({ nullable: true, type: 'text' })
  bio: string | null

  @Column({ nullable: true })
  githubUrl: string | null

  @Column({ default: false })
  completed: boolean

  @CreateDateColumn()
  createdAt: Date
}
