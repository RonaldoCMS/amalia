import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import webPush, { PushSubscription, SendResult } from 'web-push';
import { WebPushSubscriptionRepository } from '../../shared/repositories/pg/web-push-subscription.repository';

@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name);
  private readonly configured: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly repo: WebPushSubscriptionRepository,
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.configService.get<string>('VAPID_SUBJECT') ?? 'mailto:admin@example.com';

    if (publicKey && privateKey) {
      webPush.setVapidDetails(subject, publicKey, privateKey);
      this.configured = true;
    } else {
      this.logger.warn('VAPID keys not configured — Web Push (iOS) disabled. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT in .env');
      this.configured = false;
    }
  }

  async sendToUser(
    userId: string,
    payload: { title: string; body: string; data?: Record<string, string>; clickAction?: string },
  ): Promise<void> {
    if (!this.configured) return;

    const subs = await this.repo.getUserSubscriptions(userId);
    if (subs.length === 0) return;

    const notification = JSON.stringify({
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
      url: payload.clickAction ?? '/',
    });

    const results = await Promise.allSettled(
      subs.map((sub) =>
        webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } } as PushSubscription,
          notification,
        ),
      ),
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        const err = result.reason as { statusCode?: number };
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          // Subscription expired — clean up
          await this.repo.deleteByEndpoint(subs[i].endpoint).catch(() => {});
        } else {
          this.logger.error(`Web Push send failed: ${result.reason}`);
        }
      }
    }
  }
}
