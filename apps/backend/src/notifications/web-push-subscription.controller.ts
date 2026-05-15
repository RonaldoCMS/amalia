import { Controller, Post, Delete, Body, UseGuards, Req } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { SaveWebPushSubscriptionUseCase } from './usecases/save-web-push-subscription.usecase';
import { DeleteWebPushSubscriptionUseCase } from './usecases/delete-web-push-subscription.usecase';

interface SaveWebPushSubscriptionDto {
  endpoint: string;
  p256dh: string;
  auth: string;
  deviceInfo?: string;
}

interface DeleteWebPushSubscriptionDto {
  endpoint: string;
}

@Controller('notifications/web-push-subscription')
@UseGuards(JwtGuard)
export class WebPushSubscriptionController {
  constructor(
    private readonly saveUseCase: SaveWebPushSubscriptionUseCase,
    private readonly deleteUseCase: DeleteWebPushSubscriptionUseCase,
  ) {}

  @Post()
  async register(@Req() req, @Body() dto: SaveWebPushSubscriptionDto) {
    const userId = req.user.id;
    await this.saveUseCase.execute(userId, dto.endpoint, dto.p256dh, dto.auth, dto.deviceInfo);
    return { success: true };
  }

  @Delete()
  async unregister(@Body() dto: DeleteWebPushSubscriptionDto) {
    await this.deleteUseCase.execute(dto.endpoint);
    return { success: true };
  }
}
