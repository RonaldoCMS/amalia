import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('web_push_subscriptions')
@Index(['userId'])
@Index(['endpoint'], { unique: true })
export class WebPushSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  endpoint: string;

  @Column({ type: 'text', name: 'p256dh' })
  p256dh: string;

  @Column({ type: 'text', name: 'auth' })
  auth: string;

  @Column({ type: 'text', nullable: true, name: 'device_info' })
  deviceInfo: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
