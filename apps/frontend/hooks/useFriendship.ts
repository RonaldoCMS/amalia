'use client'

import { useState, useCallback, useRef } from 'react'
import { FriendshipService } from '../services/friendship.service'
import { FriendshipItem, FriendshipStatusResponse } from '@amalia/shared'

export function useFriendship() {
  const service = useRef(new FriendshipService()).current
  const [friends, setFriends] = useState<FriendshipItem[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendshipItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadFriends = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await service.getFriends()
      setFriends(data)
    } finally {
      setIsLoading(false)
    }
  }, [service])

  const loadPending = useCallback(async () => {
    const data = await service.getPendingRequests()
    setPendingRequests(data)
  }, [service])

  const sendRequest = useCallback(async (userId: string) => {
    return service.sendRequest(userId)
  }, [service])

  const acceptRequest = useCallback(async (friendshipId: string) => {
    await service.acceptRequest(friendshipId)
    setPendingRequests(prev => prev.filter(r => r.id !== friendshipId))
  }, [service])

  const rejectRequest = useCallback(async (friendshipId: string) => {
    await service.rejectRequest(friendshipId)
    setPendingRequests(prev => prev.filter(r => r.id !== friendshipId))
  }, [service])

  const removeFriend = useCallback(async (friendshipId: string) => {
    await service.removeFriend(friendshipId)
    setFriends(prev => prev.filter(f => f.id !== friendshipId))
  }, [service])

  const getStatus = useCallback(async (userId: string): Promise<FriendshipStatusResponse> => {
    return service.getStatus(userId)
  }, [service])

  return { friends, pendingRequests, isLoading, loadFriends, loadPending, sendRequest, acceptRequest, rejectRequest, removeFriend, getStatus }
}
