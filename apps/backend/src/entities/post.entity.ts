import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { User } from './user.entity'
import { PostComment } from './post-comment.entity'
import { PostLike } from './post-like.entity'

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author: User

  @Column()
  authorId: string

  @Column('text')
  content: string

  @Column({ nullable: true })
  imageUrl: string | null

  @Column({ type: 'int', default: 0 })
  likesCount: number

  @Column({ type: 'int', default: 0 })
  commentsCount: number

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @OneToMany(() => PostComment, comment => comment.post, { cascade: true })
  comments: PostComment[]

  @OneToMany(() => PostLike, like => like.post, { cascade: true })
  likes: PostLike[]
}
