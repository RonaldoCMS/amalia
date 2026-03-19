import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common'
import { FriendshipRepository } from '../../shared/repositories/pg/friendship.repository'
import { UserRepository } from '../../shared/repositories/pg/user.repository'
import { NotificationService } from '../../notifications/notification.service'
import { FriendshipStatus, NotificationType } from '@amalia/shared'

@Injectable()
export class SendFriendRequestUseCase {
  constructor(
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(requesterId: string, addresseeId: string): Promise<{ id: string }> {
    if (requesterId === addresseeId) throw new ForbiddenException('Non puoi inviarti una richiesta')

    const target = await this.userRepository.findById(addresseeId)
    if (!target) throw new NotFoundException('Utente non trovato')

    const existing = await this.friendshipRepository.findByUsers(requesterId, addresseeId)
    if (existing) {
      if (existing.status === FriendshipStatus.Accepted) throw new ConflictException('Siete già amici')
      if (existing.status === FriendshipStatus.Pending) throw new ConflictException('Richiesta già inviata')
      if (existing.status === FriendshipStatus.Blocked) throw new ForbiddenException('Operazione non consentita')
      // If rejected, allow re-sending
      if (existing.status === FriendshipStatus.Rejected) {
        await this.friendshipRepository.updateStatus(existing.id, FriendshipStatus.Pending)
        return { id: existing.id }
      }
    }

    const friendship = await this.friendshipRepository.save(requesterId, addresseeId)

    const requester = await this.userRepository.findById(requesterId)
    await this.notificationService.notify(
      addresseeId,
      NotificationType.FriendRequest,
      'Nuova richiesta di amicizia',
      `${requester?.username ?? 'Qualcuno'} ti ha inviato una richiesta di amicizia`,
      friendship.id,
    )

    return { id: friendship.id }
  }
}
