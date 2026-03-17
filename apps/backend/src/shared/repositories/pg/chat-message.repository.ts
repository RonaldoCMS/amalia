import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ChatMessage } from 'src/entities/chat-message.entity'

@Injectable()
export class ChatMessageRepository {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly repository: Repository<ChatMessage>,
  ) {}

  async getMessages(matchId: string): Promise<ChatMessage[]> {
    return this.repository.find({
      where: { match: { id: matchId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    })
  }

  async send(
    matchId: string,
    senderId: string,
    content: string | null,
    options?: { replyToId?: string | null; imageUrl?: string | null; isSystemMessage?: boolean; duelInviteId?: string | null },
  ): Promise<ChatMessage> {
    const msg = this.repository.create({
      match: { id: matchId } as any,
      sender: { id: senderId } as any,
      content: content ?? null,
      replyToId: options?.replyToId ?? null,
      imageUrl: options?.imageUrl ?? null,
      isSystemMessage: options?.isSystemMessage ?? false,
      duelInviteId: options?.duelInviteId ?? null,
    })
    return this.repository.save(msg)
  }

  async findById(id: string): Promise<ChatMessage | null> {
    return this.repository.findOne({ where: { id }, relations: ['sender'] })
  }

  async markRead(matchId: string, userId: string): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(ChatMessage)
      .set({ read: true })
      .where('matchId = :matchId AND senderId != :userId AND read = false', { matchId, userId })
      .execute()
  }
}
