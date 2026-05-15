import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotificationModule } from '../notifications/notification.module'
import { AuthModule } from '../auth/auth.module'

// Entities
import { Report } from '../entities/report.entity'
import { ModerationLog } from '../entities/moderation-log.entity'
import { Permission } from '../entities/permission.entity'
import { UserPermission } from '../entities/user-permission.entity'
import { User } from '../entities/user.entity'
import { Post } from '../entities/post.entity'
import { Duel } from '../entities/duel.entity'
import { Challenge } from '../entities/challenge.entity'
import { JobOffer } from '../entities/job-offer.entity'

// Repositories
import { ReportRepository } from './repositories/report.repository'
import { ModerationLogRepository } from './repositories/moderation-log.repository'
import { PermissionRepository } from './repositories/permission.repository'

// Seeds
import { PermissionsSeed } from './seeds/permissions.seed'

// Use cases
import { CreateReportUseCase } from './usecases/create-report.usecase'
import { GetReportsUseCase } from './usecases/get-reports.usecase'
import { ResolveReportUseCase } from './usecases/resolve-report.usecase'
import { DismissReportUseCase } from './usecases/dismiss-report.usecase'
import { BanUserUseCase } from './usecases/ban-user.usecase'
import { UnbanUserUseCase } from './usecases/unban-user.usecase'
import { MuteUserUseCase } from './usecases/mute-user.usecase'
import { UnmuteUserUseCase } from './usecases/unmute-user.usecase'
import { ModDeletePostUseCase } from './usecases/mod-delete-post.usecase'
import { ModDeleteCommentUseCase } from './usecases/mod-delete-comment.usecase'
import { ModDeleteMessageUseCase } from './usecases/mod-delete-message.usecase'
import { ModDeleteJobUseCase } from './usecases/mod-delete-job.usecase'
import { AssignRoleUseCase } from './usecases/assign-role.usecase'
import { RemoveRoleUseCase } from './usecases/remove-role.usecase'
import { ManagePermissionsUseCase } from './usecases/manage-permissions.usecase'
import { GetPlatformStatsUseCase } from './usecases/get-platform-stats.usecase'
import { GetModerationLogsUseCase } from './usecases/get-moderation-logs.usecase'
import { GetAdminUsersUseCase } from './usecases/get-admin-users.usecase'

// Controllers
import { ReportController } from './controllers/report.controller'
import { ModerationController } from './controllers/moderation.controller'
import { AdminController } from './controllers/admin.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, ModerationLog, Permission, UserPermission, User, Post, Duel, Challenge, JobOffer]),
    NotificationModule,
    AuthModule,
  ],
  controllers: [
    ReportController,
    ModerationController,
    AdminController,
  ],
  providers: [
    // Repositories
    ReportRepository,
    ModerationLogRepository,
    PermissionRepository,
    // Seeds
    PermissionsSeed,
    // Use cases
    CreateReportUseCase,
    GetReportsUseCase,
    ResolveReportUseCase,
    DismissReportUseCase,
    BanUserUseCase,
    UnbanUserUseCase,
    MuteUserUseCase,
    UnmuteUserUseCase,
    ModDeletePostUseCase,
    ModDeleteCommentUseCase,
    ModDeleteMessageUseCase,
    ModDeleteJobUseCase,
    AssignRoleUseCase,
    RemoveRoleUseCase,
    ManagePermissionsUseCase,
    GetPlatformStatsUseCase,
    GetModerationLogsUseCase,
    GetAdminUsersUseCase,
  ],
  exports: [
    PermissionRepository,
  ],
})
export class ModerationModule {}
