import {
  Column, CreateDateColumn, Entity, JoinColumn,
  ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from './user.entity'
import { JobApplication } from './job-application.entity'

@Entity('job_messages')
export class JobMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => JobApplication, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicationId' })
  application: JobApplication

  @Column()
  applicationId: string

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User

  @Column()
  senderId: string

  @Column({ type: 'text', nullable: true })
  content: string | null

  @Column({ default: false })
  isOfferPreview: boolean

  @Column({ default: false })
  read: boolean

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date
}
