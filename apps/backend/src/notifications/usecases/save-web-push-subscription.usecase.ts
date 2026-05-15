import { Injectable } from '@nestjs/common';
import { WebPushSubscriptionRepository } from '../../shared/repositories/pg/web-push-subscription.repository';

@Injectable()
export class SaveWebPushSubscriptionUseCase {
  constructor(private readonly repo: WebPushSubscriptionRepository) {}

  async execute(
    userId: string,
    endpoint: string,
    p256dh: string,
    auth: string,
    deviceInfo?: string,
  ): Promise<void> {
    await this.repo.save(userId, endpoint, p256dh, auth, deviceInfo);
  }
}
