import { ChatRepository } from '../repositories/chat.repository'
import { ChatMessageItem, SendMessageRequest } from '@amalia/shared'

export class ChatService {
  private readonly repository: ChatRepository

  constructor() {
    this.repository = new ChatRepository()
  }

  getMessages(matchId: string): Promise<ChatMessageItem[]> {
    return this.repository.getMessages(matchId)
  }

  sendMessage(matchId: string, request: SendMessageRequest): Promise<ChatMessageItem> {
    return this.repository.sendMessage(matchId, request)
  }

  sendImage(matchId: string, file: File): Promise<ChatMessageItem> {
    return this.repository.sendImage(matchId, file)
  }

  sendSystemMessage(matchId: string, content: string, duelInviteId?: string): Promise<ChatMessageItem> {
    return this.repository.sendSystemMessage(matchId, content, duelInviteId)
  }
}
