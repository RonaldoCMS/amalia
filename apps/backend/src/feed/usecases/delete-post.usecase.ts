import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PostRepository } from '../../shared/repositories/pg/post.repository'
import { FirebaseStorageService } from '../../shared/firebase/firebase-storage.service'

@Injectable()
export class DeletePostUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly firebaseStorage: FirebaseStorageService,
  ) {}

  async execute(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(postId)
    if (!post) throw new NotFoundException('Post non trovato')
    if (post.author.id !== userId) throw new ForbiddenException('Non puoi eliminare questo post')

    // Delete image from Firebase Storage if exists
    if (post.imageUrl) {
      await this.firebaseStorage.deleteFile(post.imageUrl)
    }

    await this.postRepository.delete(postId)
  }
}
