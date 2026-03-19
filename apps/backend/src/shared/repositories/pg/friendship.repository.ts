import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Friendship } from 'src/entities/friendship.entity'
import { FriendshipStatus } from '@amalia/shared'

@Injectable()
export class FriendshipRepository {
  constructor(
    @InjectRepository(Friendship)
    private readonly repository: Repository<Friendship>,
  ) {}

  async findByUsers(userId1: string, userId2: string): Promise<Friendship | null> {
    return this.repository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.requester', 'requester')
      .leftJoinAndSelect('f.addressee', 'addressee')
      .where(
        '(f.requesterId = :userId1 AND f.addresseeId = :userId2) OR (f.requesterId = :userId2 AND f.addresseeId = :userId1)',
        { userId1, userId2 },
      )
      .getOne()
  }

  async findById(id: string): Promise<Friendship | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['requester', 'addressee'],
    })
  }

  async findPendingForUser(userId: string): Promise<Friendship[]> {
    return this.repository.find({
      where: { addresseeId: userId, status: FriendshipStatus.Pending },
      relations: ['requester', 'addressee'],
      order: { createdAt: 'DESC' },
    })
  }

  async findFriendsOfUser(userId: string): Promise<Friendship[]> {
    return this.repository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.requester', 'requester')
      .leftJoinAndSelect('f.addressee', 'addressee')
      .where(
        '(f.requesterId = :userId OR f.addresseeId = :userId) AND f.status = :status',
        { userId, status: FriendshipStatus.Accepted },
      )
      .orderBy('f.updatedAt', 'DESC')
      .getMany()
  }

  async save(requesterId: string, addresseeId: string): Promise<Friendship> {
    return this.repository.save({
      requester: { id: requesterId } as any,
      requesterId,
      addressee: { id: addresseeId } as any,
      addresseeId,
      status: FriendshipStatus.Pending,
    })
  }

  async updateStatus(id: string, status: FriendshipStatus): Promise<void> {
    await this.repository.update(id, { status })
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id)
  }
}
