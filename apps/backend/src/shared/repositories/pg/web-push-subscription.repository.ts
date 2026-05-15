import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebPushSubscription } from '../../../entities/web-push-subscription.entity';

@Injectable()
export class WebPushSubscriptionRepository {
  constructor(
    @InjectRepository(WebPushSubscription)
    private readonly repository: Repository<WebPushSubscription>,
  ) {}

  async save(
    userId: string,
    endpoint: string,
    p256dh: string,
    auth: string,
    deviceInfo?: string,
  ): Promise<WebPushSubscription> {
    const existing = await this.repository.findOne({ where: { endpoint } });
    if (existing) {
      existing.userId = userId;
      existing.p256dh = p256dh;
      existing.auth = auth;
      existing.deviceInfo = deviceInfo || null;
      return this.repository.save(existing);
    }
    const sub = this.repository.create({ userId, endpoint, p256dh, auth, deviceInfo: deviceInfo || null });
    return this.repository.save(sub);
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    await this.repository.delete({ endpoint });
  }

  async getUserSubscriptions(userId: string): Promise<WebPushSubscription[]> {
    return this.repository.find({ where: { userId } });
  }
}
