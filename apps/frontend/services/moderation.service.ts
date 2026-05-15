import { ModerationRepository } from '../repositories/moderation.repository'
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

export class ModerationService {
  private readonly repository: ModerationRepository

  constructor() {
    this.repository = new ModerationRepository()
  }

  // Reports
  createReport(data: CreateReportRequest): Promise<{ id: string }> {
    return this.repository.createReport(data)
  }

  getReports(params?: { status?: string; targetType?: string; page?: number; limit?: number }): Promise<ReportListResponse> {
    return this.repository.getReports(params)
  }

  resolveReport(id: string, data: ResolveReportRequest): Promise<void> {
    return this.repository.resolveReport(id, data)
  }

  dismissReport(id: string, resolution?: string): Promise<void> {
    return this.repository.dismissReport(id, resolution)
  }

  // Moderation actions
  banUser(userId: string, data: BanUserRequest): Promise<void> {
    return this.repository.banUser(userId, data)
  }

  unbanUser(userId: string): Promise<void> {
    return this.repository.unbanUser(userId)
  }

  muteUser(userId: string, data: MuteUserRequest): Promise<void> {
    return this.repository.muteUser(userId, data)
  }

  unmuteUser(userId: string): Promise<void> {
    return this.repository.unmuteUser(userId)
  }

  modDeletePost(postId: string, reason?: string): Promise<void> {
    return this.repository.modDeletePost(postId, reason)
  }

  modDeleteComment(commentId: string, reason?: string): Promise<void> {
    return this.repository.modDeleteComment(commentId, reason)
  }

  modDeleteMessage(messageId: string, reason?: string): Promise<void> {
    return this.repository.modDeleteMessage(messageId, reason)
  }

  modDeleteJob(jobId: string, reason?: string): Promise<void> {
    return this.repository.modDeleteJob(jobId, reason)
  }

  getLogs(params?: { action?: string; moderatorId?: string; page?: number; limit?: number }): Promise<ModerationLogListResponse> {
    return this.repository.getModerationLogs(params)
  }

  // Admin
  getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<AdminUserListResponse> {
    return this.repository.getAdminUsers(params)
  }

  getUserDetail(userId: string): Promise<AdminUserDetail> {
    return this.repository.getAdminUserDetail(userId)
  }

  assignRole(userId: string, data: AssignRoleRequest): Promise<void> {
    return this.repository.assignRole(userId, data)
  }

  removeRole(userId: string): Promise<void> {
    return this.repository.removeRole(userId)
  }

  getUserPermissions(userId: string): Promise<UserPermissionItem[]> {
    return this.repository.getUserPermissions(userId)
  }

  getAllPermissions(): Promise<PermissionItem[]> {
    return this.repository.getAllPermissions()
  }

  grantPermission(userId: string, data: GrantPermissionRequest): Promise<void> {
    return this.repository.grantPermission(userId, data)
  }

  revokePermission(userId: string, permissionKey: string): Promise<void> {
    return this.repository.revokePermission(userId, permissionKey)
  }

  getStats(): Promise<PlatformStats> {
    return this.repository.getStats()
  }

  getTrends(): Promise<PlatformTrends> {
    return this.repository.getTrends()
  }
}
