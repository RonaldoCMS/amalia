import { Injectable } from '@nestjs/common';
import { WebPushSubscriptionRepository } from '../../shared/repositories/pg/web-push-subscription.repository';

@Injectable()
export class DeleteWebPushSubscriptionUseCase {
  constructor(private readonly repo: WebPushSubscriptionRepository) {}

  async execute(endpoint: string): Promise<void> {
    await this.repo.deleteByEndpoint(endpoint);
  }
}
