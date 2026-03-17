import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @Column()
  type: string

  @Column()
  title: string

  @Column({ type: 'text' })
  body: string

  @Column({ nullable: true })
  referenceId: string | null

  @Column({ default: false })
  read: boolean

  @CreateDateColumn()
  createdAt: Date
}
