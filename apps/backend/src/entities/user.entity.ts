import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserChallenge } from './user-challenge.entity'
import { UserOnboarding } from './user-onboarding.entity'

export enum UserRoleEnum {
  User = 'user',
  Moderator = 'moderator',
  Admin = 'admin',
  Founder = 'founder',
}

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

  @Column({ type: 'varchar', default: UserRoleEnum.User })
  role: UserRoleEnum

  @Column({ type: 'timestamptz', nullable: true })
  duelBanUntil: Date | null

  @Column({ type: 'timestamptz', nullable: true })
  bannedUntil: Date | null

  @Column({ type: 'text', nullable: true })
  banReason: string | null

  @Column({ type: 'boolean', default: false })
  isMuted: boolean

  @Column({ type: 'timestamptz', nullable: true })
  mutedUntil: Date | null

  @Column({ type: 'timestamptz', nullable: true })
  chatBanUntil: Date | null

  @Column({ type: 'timestamptz', nullable: true })
  challengeBanUntil: Date | null

  @CreateDateColumn()
  createdAt: Date

  @OneToMany(() => UserChallenge, userChallenge => userChallenge.user)
  userChallenges: UserChallenge[]

  @OneToOne(() => UserOnboarding, onboarding => onboarding.user)
  onboarding: UserOnboarding

  @Column({ nullable: true, unique: true })
  githubId: string

  @Column({ nullable: true, default: null })
  preferredLanguage: string | null

}