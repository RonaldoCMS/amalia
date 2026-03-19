import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './user.entity'
import { CvMessage, CvData, CvAmaliaStats } from '@amalia/shared'

@Entity('user_cv')
export class UserCv {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  userId: string

  @Column()
  username: string

  @Column({ type: 'varchar', default: 'interviewing' })
  status: string

  @Column({ type: 'jsonb', default: [] })
  messages: CvMessage[]

  @Column({ type: 'jsonb', nullable: true })
  cvData: CvData | null

  @Column({ type: 'jsonb', nullable: true })
  amaliaStats: CvAmaliaStats | null

  @Column({ default: true })
  isPublic: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
