import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtGuard } from '../../auth/guards/jwt.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { PermissionsGuard } from '../../auth/guards/permissions.guard'
import { BanGuard } from '../../auth/guards/ban.guard'
import { Roles } from '../../auth/decorators/roles.decorator'
import { RequirePermission } from '../../auth/decorators/permissions.decorator'
import { UserRoleEnum } from '../../entities/user.entity'
import { CreateReportUseCase } from '../usecases/create-report.usecase'
import { GetReportsUseCase } from '../usecases/get-reports.usecase'
import { ResolveReportUseCase } from '../usecases/resolve-report.usecase'
import { DismissReportUseCase } from '../usecases/dismiss-report.usecase'

@Controller('reports')
@UseGuards(JwtGuard, BanGuard)
export class ReportController {
  constructor(
    private readonly createReport: CreateReportUseCase,
    private readonly getReports: GetReportsUseCase,
    private readonly resolveReport: ResolveReportUseCase,
    private readonly dismissReport: DismissReportUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Request() req: { user: { id: string } },
    @Body() body: { targetType: string; targetId: string; reportedUserId?: string; reason: string; description?: string },
  ) {
    return this.createReport.execute(req.user.id, body as any)
  }

  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(UserRoleEnum.Moderator)
  @RequirePermission('manage_reports')
  list(
    @Query('status') status?: string,
    @Query('targetType') targetType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.getReports.execute({
      status,
      targetType,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    })
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(UserRoleEnum.Moderator)
  @RequirePermission('manage_reports')
  @HttpCode(HttpStatus.NO_CONTENT)
  resolve(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() body: { resolution: string },
  ) {
    return this.resolveReport.execute(id, req.user.id, body.resolution)
  }

  @Patch(':id/dismiss')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(UserRoleEnum.Moderator)
  @RequirePermission('manage_reports')
  @HttpCode(HttpStatus.NO_CONTENT)
  dismiss(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() body: { resolution?: string },
  ) {
    return this.dismissReport.execute(id, req.user.id, body.resolution)
  }
}
