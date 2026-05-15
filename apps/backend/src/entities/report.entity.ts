import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'

export enum ReportTargetTypeEnum {
  Post = 'post',
  Comment = 'comment',
  ChatMessage = 'chat_message',
  UserProfile = 'user_profile',
  JobOffer = 'job_offer',
}

export enum ReportReasonEnum {
  Spam = 'spam',
  Harassment = 'harassment',
  HateSpeech = 'hate_speech',
  InappropriateContent = 'inappropriate_content',
  Impersonation = 'impersonation',
  Other = 'other',
}

export enum ReportStatusEnum {
  Pending = 'pending',
  Reviewing = 'reviewing',
  Resolved = 'resolved',
  Dismissed = 'dismissed',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  reporter: User

  @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
  reportedUser: User | null

  @Column({ type: 'varchar' })
  targetType: ReportTargetTypeEnum

  @Column({ type: 'uuid' })
  targetId: string

  @Column({ type: 'varchar' })
  reason: ReportReasonEnum

  @Column({ type: 'text', nullable: true })
  description: string | null

  @Column({ type: 'varchar', default: ReportStatusEnum.Pending })
  status: ReportStatusEnum

  @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
  resolvedBy: User | null

  @Column({ type: 'text', nullable: true })
  resolution: string | null

  @CreateDateColumn()
  createdAt: Date

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null
}
