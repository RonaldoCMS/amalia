import { Injectable, NotFoundException } from '@nestjs/common'
import { PostCommentRepository } from '../../shared/repositories/pg/post-comment.repository'
import { PostRepository } from '../../shared/repositories/pg/post.repository'
import { NotificationService } from '../../notifications/notification.service'
import { CommentItem, NotificationType } from '@amalia/shared'

@Injectable()
export class CreateCommentUseCase {
  constructor(
    private readonly postCommentRepository: PostCommentRepository,
    private readonly postRepository: PostRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(postId: string, userId: string, content: string): Promise<CommentItem> {
    const post = await this.postRepository.findById(postId)
    if (!post) throw new NotFoundException('Post non trovato')

    const comment = await this.postCommentRepository.save(postId, userId, content)
    await this.postRepository.incrementComments(postId)

    const saved = await this.postCommentRepository.findById(comment.id)

    // Notify post author
    if (post.author.id !== userId) {
      await this.notificationService.notify(
        post.author.id,
        NotificationType.NewComment,
        'Nuovo commento',
        content.slice(0, 80),
        postId,
      )
    }

    return {
      id: saved!.id,
      authorId: saved!.author.id,
      authorUsername: saved!.author.username,
      authorProfilePhotoUrl: saved!.author.profilePhotoUrl,
      content: saved!.content,
      createdAt: saved!.createdAt.toISOString(),
    }
  }
}
