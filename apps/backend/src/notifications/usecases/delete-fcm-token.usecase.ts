import { Injectable } from '@nestjs/common';
import { FCMTokenRepository } from 'src/shared/repositories/pg/fcm-token.repository';
 
@Injectable()
export class DeleteFCMTokenUseCase {
  constructor(private readonly fcmTokenRepository: FCMTokenRepository) {}

  async execute(token: string): Promise<void> {
    if (!token) {
      throw new Error('FCM token is required');
    }

    await this.fcmTokenRepository.deleteToken(token);
  }
}
