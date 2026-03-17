import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'
import { DevMatch } from './dev-match.entity'

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => DevMatch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matchId' })
  match: DevMatch

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User

  @Column({ type: 'text', nullable: true })
  content: string | null

  @Column({ nullable: true })
  replyToId: string | null

  @Column({ nullable: true })
  imageUrl: string | null

  @Column({ nullable: true })
  duelInviteId: string | null

  @Column({ default: false })
  isSystemMessage: boolean

  @Column({ default: false })
  read: boolean

  @CreateDateColumn()
  createdAt: Date
}
