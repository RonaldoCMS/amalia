import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FCMToken } from '../../../entities/fcm-token.entity';

@Injectable()
export class FCMTokenRepository {
  constructor(
    @InjectRepository(FCMToken)
    private readonly repository: Repository<FCMToken>,
  ) {}

  async saveToken(
    userId: string,
    token: string,
    deviceInfo?: string,
  ): Promise<FCMToken> {
    // Check if token already exists
    const existing = await this.repository.findOne({ where: { token } });
    
    if (existing) {
      // Update existing token
      existing.userId = userId;
      existing.deviceInfo = deviceInfo || null;
      existing.updatedAt = new Date();
      return this.repository.save(existing);
    }

    // Create new token
    const fcmToken = this.repository.create({
      userId,
      token,
      deviceInfo: deviceInfo || null,
    });

    return this.repository.save(fcmToken);
  }

  async deleteToken(token: string): Promise<void> {
    await this.repository.delete({ token });
  }

  async deleteUserTokens(userId: string): Promise<void> {
    await this.repository.delete({ userId });
  }

  async getUserTokens(userId: string): Promise<string[]> {
    const tokens = await this.repository.find({
      where: { userId },
      select: ['token'],
    });
    return tokens.map((t) => t.token);
  }

  async deleteExpiredTokens(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('updated_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
