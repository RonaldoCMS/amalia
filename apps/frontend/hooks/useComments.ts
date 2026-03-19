'use client'

import { useState, useCallback, useRef } from 'react'
import { FeedService } from '../services/feed.service'
import { CommentItem } from '@amalia/shared'

export function useComments(postId: string) {
  const service = useRef(new FeedService()).current
  const [comments, setComments] = useState<CommentItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await service.getComments(postId)
      setComments(data)
    } finally {
      setIsLoading(false)
    }
  }, [postId, service])

  const addComment = useCallback(async (content: string) => {
    const comment = await service.createComment(postId, content)
    setComments(prev => [...prev, comment])
    return comment
  }, [postId, service])

  const deleteComment = useCallback(async (commentId: string) => {
    await service.deleteComment(commentId)
    setComments(prev => prev.filter(c => c.id !== commentId))
  }, [service])

  return { comments, isLoading, load, addComment, deleteComment }
}
