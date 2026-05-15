'use client'

import { useState, useCallback, useRef } from 'react'
import { ModerationService } from '../services/moderation.service'
import {
  AdminUserItem,
  AdminUserDetail,
  PlatformStats,
  PlatformTrends,
  PermissionItem,
  UserRole,
  PermissionKey,
} from '@amalia/shared'

export function useAdmin() {
  const service = useRef(new ModerationService()).current
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null)
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [trends, setTrends] = useState<PlatformTrends | null>(null)
  const [permissions, setPermissions] = useState<PermissionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadUsers = useCallback(async (params?: { page?: number; limit?: number; search?: string }) => {
    setIsLoading(true)
    try {
      const res = await service.getUsers(params)
      setUsers(res.users)
      setTotalUsers(res.total)
    } finally {
      setIsLoading(false)
    }
  }, [service])

  const loadUserDetail = useCallback(async (userId: string) => {
    setIsLoading(true)
    try {
      const detail = await service.getUserDetail(userId)
      setUserDetail(detail)
    } finally {
      setIsLoading(false)
    }
  }, [service])

  const assignRole = useCallback(async (userId: string, role: UserRole) => {
    await service.assignRole(userId, { role })
  }, [service])

  const removeRole = useCallback(async (userId: string) => {
    await service.removeRole(userId)
  }, [service])

  const loadAllPermissions = useCallback(async () => {
    const perms = await service.getAllPermissions()
    setPermissions(perms)
  }, [service])

  const grantPermission = useCallback(async (userId: string, permissionKey: PermissionKey) => {
    await service.grantPermission(userId, { permissionKey })
  }, [service])

  const revokePermission = useCallback(async (userId: string, permissionKey: string) => {
    await service.revokePermission(userId, permissionKey)
  }, [service])

  const loadStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const s = await service.getStats()
      setStats(s)
    } finally {
      setIsLoading(false)
    }
  }, [service])

  const loadTrends = useCallback(async () => {
    setIsLoading(true)
    try {
      const t = await service.getTrends()
      setTrends(t)
    } finally {
      setIsLoading(false)
    }
  }, [service])

  return {
    users, totalUsers, userDetail, stats, trends, permissions, isLoading,
    loadUsers, loadUserDetail, assignRole, removeRole,
    loadAllPermissions, grantPermission, revokePermission,
    loadStats, loadTrends,
  }
}
