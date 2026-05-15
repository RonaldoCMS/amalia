import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'

export enum ModerationActionEnum {
  Ban = 'ban',
  Unban = 'unban',
  Mute = 'mute',
  Unmute = 'unmute',
  DeletePost = 'delete_post',
  DeleteComment = 'delete_comment',
  DeleteMessage = 'delete_message',
  DeleteJob = 'delete_job',
  ResolveReport = 'resolve_report',
  DismissReport = 'dismiss_report',
  AssignRole = 'assign_role',
  RemoveRole = 'remove_role',
  GrantPermission = 'grant_permission',
  RevokePermission = 'revoke_permission',
}

@Entity('moderation_logs')
export class ModerationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL' })
  moderator: User

  @ManyToOne(() => User, { nullable: true, eager: true, onDelete: 'SET NULL' })
  targetUser: User | null

  @Column({ type: 'varchar' })
  action: ModerationActionEnum

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null

  @CreateDateColumn()
  createdAt: Date
}
