import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { User } from './user.entity'
import { Post } from './post.entity'

@Entity('post_likes')
@Unique(['post', 'user'])
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Post, post => post.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date
}
