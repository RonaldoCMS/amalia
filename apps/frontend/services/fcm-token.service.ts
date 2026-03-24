import { FCMTokenRepository } from '../repositories/fcm-token.repository';

export const FCMTokenService = {
  async registerToken(token: string): Promise<void> {
    try {
      await FCMTokenRepository.registerToken(token);
    } catch (error) {
      console.error('Failed to register FCM token:', error);
      throw error;
    }
  },

  async deleteToken(token: string): Promise<void> {
    try {
      await FCMTokenRepository.deleteToken(token);
    } catch (error) {
      console.error('Failed to delete FCM token:', error);
      throw error;
    }
  },
};
