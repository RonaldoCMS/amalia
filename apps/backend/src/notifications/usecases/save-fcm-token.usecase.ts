import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FCMTokenRepository } from 'src/shared/repositories/pg/fcm-token.repository';
 
@Injectable()
export class SaveFCMTokenUseCase {
  constructor(private readonly fcmTokenRepository: FCMTokenRepository) {}

  async execute(
    userId: string,
    token: string,
    deviceInfo?: string,
  ): Promise<void> {
    if (!userId) {
      throw new UnauthorizedException('User ID is required');
    }

    if (!token) {
      throw new Error('FCM token is required');
    }

    await this.fcmTokenRepository.saveToken(userId, token, deviceInfo);
  }
}
