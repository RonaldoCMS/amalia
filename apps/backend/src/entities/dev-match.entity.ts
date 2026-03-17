import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'

@Entity('dev_matches')
export class DevMatch {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user1Id' })
  user1: User

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user2Id' })
  user2: User

  @Column({ default: false })
  user1Liked: boolean

  @Column({ default: false })
  user2Liked: boolean

  @Column({ type: 'int', default: 0 })
  compatibilityScore: number

  @Column({ type: 'timestamptz', nullable: true })
  matchedAt: Date | null

  @Column({ default: false })
  archivedByUser1: boolean

  @Column({ default: false })
  archivedByUser2: boolean

  @CreateDateColumn()
  createdAt: Date
}
