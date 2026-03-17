import { Controller, Get, Post, Param, Request, UseGuards } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { NotificationItem, UnreadCountResponse } from '@amelia/shared'

@Controller('notifications')
@UseGuards(JwtGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getNotifications(@Request() req: { user: { id: string } }): Promise<NotificationItem[]> {
    return this.notificationService.getNotifications(req.user.id)
  }

  @Get('unread-count')
  getUnreadCount(@Request() req: { user: { id: string } }): Promise<UnreadCountResponse> {
    return this.notificationService.getUnreadCount(req.user.id)
  }

  @Post('read-all')
  markAllRead(@Request() req: { user: { id: string } }): Promise<void> {
    return this.notificationService.markAllRead(req.user.id)
  }

  @Post(':id/read')
  markRead(@Param('id') id: string, @Request() req: { user: { id: string } }): Promise<void> {
    return this.notificationService.markRead(id, req.user.id)
  }
}
