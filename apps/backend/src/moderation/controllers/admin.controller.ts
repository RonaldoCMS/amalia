import { Body, Controller, Delete, Get, Param, Post, Query, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtGuard } from '../../auth/guards/jwt.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { PermissionsGuard } from '../../auth/guards/permissions.guard'
import { BanGuard } from '../../auth/guards/ban.guard'
import { Roles } from '../../auth/decorators/roles.decorator'
import { RequirePermission } from '../../auth/decorators/permissions.decorator'
import { UserRoleEnum } from '../../entities/user.entity'
import { AssignRoleUseCase } from '../usecases/assign-role.usecase'
import { RemoveRoleUseCase } from '../usecases/remove-role.usecase'
import { ManagePermissionsUseCase } from '../usecases/manage-permissions.usecase'
import { GetAdminUsersUseCase } from '../usecases/get-admin-users.usecase'
import { GetPlatformStatsUseCase } from '../usecases/get-platform-stats.usecase'

@Controller('admin')
@UseGuards(JwtGuard, BanGuard, RolesGuard)
@Roles(UserRoleEnum.Admin)
export class AdminController {
  constructor(
    private readonly assignRole: AssignRoleUseCase,
    private readonly removeRole: RemoveRoleUseCase,
    private readonly managePermissions: ManagePermissionsUseCase,
    private readonly getAdminUsers: GetAdminUsersUseCase,
    private readonly getStats: GetPlatformStatsUseCase,
  ) {}

  // Users
  @Get('users')
  @UseGuards(PermissionsGuard)
  @RequirePermission('manage_users')
  listUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.getAdminUsers.list({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      search,
    })
  }

  @Get('users/:userId')
  @UseGuards(PermissionsGuard)
  @RequirePermission('manage_users')
  getUserDetail(@Param('userId') userId: string) {
    return this.getAdminUsers.detail(userId)
  }

  // Roles
  @Post('users/:userId/role')
  @UseGuards(PermissionsGuard)
  @RequirePermission('assign_moderator')
  @HttpCode(HttpStatus.NO_CONTENT)
  assignUserRole(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
    @Body() body: { role: string },
  ) {
    return this.assignRole.execute(userId, req.user.id, body.role as UserRoleEnum)
  }

  @Delete('users/:userId/role')
  @UseGuards(PermissionsGuard)
  @RequirePermission('assign_moderator')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeUserRole(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.removeRole.execute(userId, req.user.id)
  }

  // Permissions
  @Get('users/:userId/permissions')
  @UseGuards(PermissionsGuard)
  @RequirePermission('manage_permissions')
  getUserPermissions(@Param('userId') userId: string) {
    return this.managePermissions.getUserPermissions(userId)
  }

  @Get('permissions')
  @UseGuards(PermissionsGuard)
  @RequirePermission('manage_permissions')
  getAllPermissions() {
    return this.managePermissions.getAllPermissions()
  }

  @Post('users/:userId/permissions')
  @UseGuards(PermissionsGuard)
  @RequirePermission('manage_permissions')
  @HttpCode(HttpStatus.NO_CONTENT)
  grantPermission(
    @Param('userId') userId: string,
    @Request() req: { user: { id: string } },
    @Body() body: { permissionKey: string },
  ) {
    return this.managePermissions.grant(userId, req.user.id, body.permissionKey)
  }

  @Delete('users/:userId/permissions/:permissionKey')
  @UseGuards(PermissionsGuard)
  @RequirePermission('manage_permissions')
  @HttpCode(HttpStatus.NO_CONTENT)
  revokePermission(
    @Param('userId') userId: string,
    @Param('permissionKey') permissionKey: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.managePermissions.revoke(userId, req.user.id, permissionKey)
  }

  // Stats
  @Get('stats')
  @UseGuards(PermissionsGuard)
  @RequirePermission('view_stats')
  stats() {
    return this.getStats.getStats()
  }

  @Get('stats/trends')
  @UseGuards(PermissionsGuard)
  @RequirePermission('view_advanced_stats')
  trends() {
    return this.getStats.getTrends()
  }
}
