import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'
import { Post } from './post.entity'

@Entity('post_comments')
export class PostComment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Post, post => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post

  @Column()
  postId: string

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User

  @Column()
  authorId: string

  @Column('text')
  content: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date
}
