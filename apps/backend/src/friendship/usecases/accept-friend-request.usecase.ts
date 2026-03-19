import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { FriendshipRepository } from '../../shared/repositories/pg/friendship.repository'
import { DevMatchRepository } from '../../shared/repositories/pg/dev-match.repository'
import { NotificationService } from '../../notifications/notification.service'
import { FriendshipStatus, NotificationType } from '@amalia/shared'

@Injectable()
export class AcceptFriendRequestUseCase {
  constructor(
    private readonly friendshipRepository: FriendshipRepository,
    private readonly devMatchRepository: DevMatchRepository,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(friendshipId: string, userId: string): Promise<void> {
    const friendship = await this.friendshipRepository.findById(friendshipId)
    if (!friendship) throw new NotFoundException('Richiesta non trovata')
    if (friendship.addresseeId !== userId) throw new ForbiddenException('Non puoi accettare questa richiesta')
    if (friendship.status !== FriendshipStatus.Pending) throw new ForbiddenException('Richiesta non più pendente')

    await this.friendshipRepository.updateStatus(friendshipId, FriendshipStatus.Accepted)

    // Create a DevMatch so they can chat
    const existingMatch = await this.devMatchRepository.findByUsers(friendship.requesterId, friendship.addresseeId)
    if (!existingMatch) {
      const match = await this.devMatchRepository.createLike(friendship.requesterId, friendship.addresseeId, 100)
      await this.devMatchRepository.setMutualMatch(match)
    } else if (!existingMatch.matchedAt) {
      await this.devMatchRepository.setMutualMatch(existingMatch)
    }

    // Notify requester
    await this.notificationService.notify(
      friendship.requesterId,
      NotificationType.FriendAccepted,
      'Richiesta accettata',
      `${friendship.addressee.username} ha accettato la tua richiesta di amicizia`,
      friendshipId,
    )
  }
}
