import axios, { AxiosInstance } from 'axios'
import {
  CreateReportRequest,
  ReportListResponse,
  ResolveReportRequest,
  ModerationLogListResponse,
  BanUserRequest,
  MuteUserRequest,
  AdminUserListResponse,
  AdminUserDetail,
  AssignRoleRequest,
  GrantPermissionRequest,
  PlatformStats,
  PlatformTrends,
  PermissionItem,
  UserPermissionItem,
} from '@amalia/shared'

export class ModerationRepository {
  private readonly client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
      headers: { 'Content-Type': 'application/json' },
    })

    this.client.interceptors.request.use(config => {
      const token = localStorage.getItem('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })
  }

  // Reports
  async createReport(data: CreateReportRequest): Promise<{ id: string }> {
    const res = await this.client.post<{ id: string }>('/reports', data)
    return res.data
  }

  async getReports(params?: { status?: string; targetType?: string; page?: number; limit?: number }): Promise<ReportListResponse> {
    const res = await this.client.get<ReportListResponse>('/reports', { params })
    return res.data
  }

  async resolveReport(id: string, data: ResolveReportRequest): Promise<void> {
    await this.client.patch(`/reports/${id}/resolve`, data)
  }

  async dismissReport(id: string, resolution?: string): Promise<void> {
    await this.client.patch(`/reports/${id}/dismiss`, { resolution })
  }

  // Moderation actions
  async banUser(userId: string, data: BanUserRequest): Promise<void> {
    await this.client.post(`/moderation/users/${userId}/ban`, data)
  }

  async unbanUser(userId: string): Promise<void> {
    await this.client.post(`/moderation/users/${userId}/unban`)
  }

  async muteUser(userId: string, data: MuteUserRequest): Promise<void> {
    await this.client.post(`/moderation/users/${userId}/mute`, data)
  }

  async unmuteUser(userId: string): Promise<void> {
    await this.client.post(`/moderation/users/${userId}/unmute`)
  }

  async modDeletePost(postId: string, reason?: string): Promise<void> {
    await this.client.delete(`/moderation/posts/${postId}`, { data: { reason } })
  }

  async modDeleteComment(commentId: string, reason?: string): Promise<void> {
    await this.client.delete(`/moderation/comments/${commentId}`, { data: { reason } })
  }

  async modDeleteMessage(messageId: string, reason?: string): Promise<void> {
    await this.client.delete(`/moderation/messages/${messageId}`, { data: { reason } })
  }

  async modDeleteJob(jobId: string, reason?: string): Promise<void> {
    await this.client.delete(`/moderation/jobs/${jobId}`, { data: { reason } })
  }

  async getModerationLogs(params?: { action?: string; moderatorId?: string; page?: number; limit?: number }): Promise<ModerationLogListResponse> {
    const res = await this.client.get<ModerationLogListResponse>('/moderation/logs', { params })
    return res.data
  }

  // Admin
  async getAdminUsers(params?: { page?: number; limit?: number; search?: string }): Promise<AdminUserListResponse> {
    const res = await this.client.get<AdminUserListResponse>('/admin/users', { params })
    return res.data
  }

  async getAdminUserDetail(userId: string): Promise<AdminUserDetail> {
    const res = await this.client.get<AdminUserDetail>(`/admin/users/${userId}`)
    return res.data
  }

  async assignRole(userId: string, data: AssignRoleRequest): Promise<void> {
    await this.client.post(`/admin/users/${userId}/role`, data)
  }

  async removeRole(userId: string): Promise<void> {
    await this.client.delete(`/admin/users/${userId}/role`)
  }

  async getUserPermissions(userId: string): Promise<UserPermissionItem[]> {
    const res = await this.client.get<UserPermissionItem[]>(`/admin/users/${userId}/permissions`)
    return res.data
  }

  async getAllPermissions(): Promise<PermissionItem[]> {
    const res = await this.client.get<PermissionItem[]>('/admin/permissions')
    return res.data
  }

  async grantPermission(userId: string, data: GrantPermissionRequest): Promise<void> {
    await this.client.post(`/admin/users/${userId}/permissions`, data)
  }

  async revokePermission(userId: string, permissionKey: string): Promise<void> {
    await this.client.delete(`/admin/users/${userId}/permissions/${permissionKey}`)
  }

  async getStats(): Promise<PlatformStats> {
    const res = await this.client.get<PlatformStats>('/admin/stats')
    return res.data
  }

  async getTrends(): Promise<PlatformTrends> {
    const res = await this.client.get<PlatformTrends>('/admin/stats/trends')
    return res.data
  }
}
