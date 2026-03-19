import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm'
import { User } from './user.entity'
import { FriendshipStatus } from '@amalia/shared'

@Entity('friendships')
@Unique(['requester', 'addressee'])
export class Friendship {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requesterId' })
  requester: User

  @Column()
  requesterId: string

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'addresseeId' })
  addressee: User

  @Column()
  addresseeId: string

  @Column({ type: 'enum', enum: FriendshipStatus, default: FriendshipStatus.Pending })
  status: FriendshipStatus

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
