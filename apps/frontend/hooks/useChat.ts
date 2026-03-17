import { useState, useCallback, useRef, useEffect } from 'react'
import { ChatMessageItem } from '@amalia/shared'
import { ChatService } from '../services/chat.service'

interface UseChatReturn {
  messages: ChatMessageItem[]
  isLoading: boolean
  send: (content: string, replyToId?: string | null) => Promise<void>
  sendImage: (file: File) => Promise<void>
  sendSystemMessage: (content: string, duelInviteId?: string) => Promise<ChatMessageItem>
}

export function useChat(matchId: string, myUserId: string): UseChatReturn {
  const service = useRef(new ChatService())
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const data = await service.current.getMessages(matchId)
      setMessages(data)
    } catch {
      // ignore
    }
  }, [matchId])

  useEffect(() => {
    fetchMessages().finally(() => setIsLoading(false))
    pollRef.current = setInterval(fetchMessages, 3000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchMessages])

  const send = useCallback(async (content: string, replyToId?: string | null) => {
    const msg = await service.current.sendMessage(matchId, { content, replyToId })
    setMessages(prev => [...prev, msg])
  }, [matchId])

  const sendImage = useCallback(async (file: File) => {
    const msg = await service.current.sendImage(matchId, file)
    setMessages(prev => [...prev, msg])
  }, [matchId])

  const sendSystemMessage = useCallback(async (content: string, duelInviteId?: string): Promise<ChatMessageItem> => {
    const msg = await service.current.sendSystemMessage(matchId, content, duelInviteId)
    setMessages(prev => [...prev, msg])
    return msg
  }, [matchId])

  return { messages, isLoading, send, sendImage, sendSystemMessage }
}
