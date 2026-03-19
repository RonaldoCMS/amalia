'use client'

import { useState, useCallback, useRef } from 'react'
import { FeedService } from '../services/feed.service'
import { PostItem } from '@amalia/shared'

export function useFeed() {
  const service = useRef(new FeedService()).current
  const [posts, setPosts] = useState<PostItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadFeed = useCallback(async (reset = false) => {
    setIsLoading(true)
    try {
      const p = reset ? 1 : page
      const res = await service.getFeed(p, 20)
      if (reset) {
        setPosts(res.posts)
      } else {
        setPosts(prev => {
          const ids = new Set(prev.map(x => x.id))
          return [...prev, ...res.posts.filter(x => !ids.has(x.id))]
        })
      }
      setHasMore(res.posts.length === 20)
      setPage(reset ? 2 : p + 1)
    } finally {
      setIsLoading(false)
    }
  }, [page, service])

  const createPost = useCallback(async (content: string, image?: File) => {
    const post = await service.createPost(content, image)
    setPosts(prev => [post, ...prev])
    return post
  }, [service])

  const toggleLike = useCallback(async (postId: string) => {
    const { liked } = await service.toggleLike(postId)
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, likedByMe: liked, likesCount: p.likesCount + (liked ? 1 : -1) }
        : p,
    ))
  }, [service])

  const deletePost = useCallback(async (postId: string) => {
    await service.deletePost(postId)
    setPosts(prev => prev.filter(p => p.id !== postId))
  }, [service])

  return { posts, isLoading, hasMore, loadFeed, createPost, toggleLike, deletePost }
}
