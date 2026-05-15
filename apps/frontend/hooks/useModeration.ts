'use client'

import { useState, useCallback, useRef } from 'react'
import { ModerationService } from '../services/moderation.service'
import {
  CreateReportRequest,
  ReportItem,  ReportStatus,  ModerationLogItem,
  BanUserRequest,
  MuteUserRequest,
} from '@amalia/shared'

export function useModeration() {
  const service = useRef(new ModerationService()).current
  const [reports, setReports] = useState<ReportItem[]>([])
  const [logs, setLogs] = useState<ModerationLogItem[]>([])
  const [totalReports, setTotalReports] = useState(0)
  const [totalLogs, setTotalLogs] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const createReport = useCallback(async (data: CreateReportRequest) => {
    return service.createReport(data)
  }, [service])

  const loadReports = useCallback(async (params?: { status?: string; targetType?: string; page?: number; limit?: number }) => {
    setIsLoading(true)
    try {
      const res = await service.getReports(params)
      setReports(res.reports)
      setTotalReports(res.total)
      return res
    } finally {
      setIsLoading(false)
    }
  }, [service])

  const resolveReport = useCallback(async (id: string, resolution: string) => {
    await service.resolveReport(id, { resolution })
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: ReportStatus.Resolved } : r))
  }, [service])

  const dismissReport = useCallback(async (id: string, resolution?: string) => {
    await service.dismissReport(id, resolution)
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: ReportStatus.Dismissed } : r))
  }, [service])

  const banUser = useCallback(async (userId: string, data: BanUserRequest) => {
    await service.banUser(userId, data)
  }, [service])

  const unbanUser = useCallback(async (userId: string) => {
    await service.unbanUser(userId)
  }, [service])

  const muteUser = useCallback(async (userId: string, data: MuteUserRequest) => {
    await service.muteUser(userId, data)
  }, [service])

  const unmuteUser = useCallback(async (userId: string) => {
    await service.unmuteUser(userId)
  }, [service])

  const deletePost = useCallback(async (postId: string, reason?: string) => {
    await service.modDeletePost(postId, reason)
  }, [service])

  const deleteComment = useCallback(async (commentId: string, reason?: string) => {
    await service.modDeleteComment(commentId, reason)
  }, [service])

  const deleteMessage = useCallback(async (messageId: string, reason?: string) => {
    await service.modDeleteMessage(messageId, reason)
  }, [service])

  const deleteJob = useCallback(async (jobId: string, reason?: string) => {
    await service.modDeleteJob(jobId, reason)
  }, [service])

  const loadLogs = useCallback(async (params?: { action?: string; moderatorId?: string; page?: number; limit?: number }) => {
    setIsLoading(true)
    try {
      const res = await service.getLogs(params)
      setLogs(res.logs)
      setTotalLogs(res.total)
      return res
    } finally {
      setIsLoading(false)
    }
  }, [service])

  return {
    reports, totalReports, logs, totalLogs, isLoading,
    createReport, loadReports, resolveReport, dismissReport,
    banUser, unbanUser, muteUser, unmuteUser,
    deletePost, deleteComment, deleteMessage, deleteJob,
    loadLogs,
  }
}
