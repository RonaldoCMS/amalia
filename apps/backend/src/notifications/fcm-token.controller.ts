import { Controller, Post, Delete, Body, UseGuards, Req } from '@nestjs/common';
import { SaveFCMTokenUseCase } from './usecases/save-fcm-token.usecase';
import { DeleteFCMTokenUseCase } from './usecases/delete-fcm-token.usecase';
import { JwtGuard } from 'src/auth/guards/jwt.guard'

interface SaveFCMTokenDto {
  token: string;
  deviceInfo?: string;
}

interface DeleteFCMTokenDto {
  token: string;
}

@Controller('notifications/fcm-token')
@UseGuards(JwtGuard)
export class FCMTokenController {
  constructor(
    private readonly saveFCMTokenUseCase: SaveFCMTokenUseCase,
    private readonly deleteFCMTokenUseCase: DeleteFCMTokenUseCase,
  ) {}

  @Post()
  async registerToken(@Req() req, @Body() dto: SaveFCMTokenDto) {
    const userId = req.user.id;
    await this.saveFCMTokenUseCase.execute(userId, dto.token, dto.deviceInfo);
    return { success: true, message: 'FCM token registered successfully' };
  }

  @Delete()
  async deleteToken(@Body() dto: DeleteFCMTokenDto) {
    await this.deleteFCMTokenUseCase.execute(dto.token);
    return { success: true, message: 'FCM token deleted successfully' };
  }
}
