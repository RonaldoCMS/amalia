import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, string>;
  clickAction?: string;
}

@Injectable()
export class FirebaseMessagingService {
  private readonly logger = new Logger(FirebaseMessagingService.name);

  /**
   * Send push notification to a single device token
   */
  async sendNotification(
    token: string,
    payload: PushNotificationPayload,
  ): Promise<boolean> {
    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.icon,
        },
        data: payload.data || {},
        webpush: payload.clickAction
          ? {
              fcmOptions: {
                link: payload.clickAction,
              },
            }
          : undefined,
      };

      await admin.messaging().send(message);
      this.logger.log(`Notification sent successfully to token: ${token.substring(0, 20)}...`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if token is invalid or unregistered
      if (
        errorMessage.includes('registration-token-not-registered') ||
        errorMessage.includes('invalid-registration-token')
      ) {
        this.logger.warn(`Invalid or unregistered token: ${token.substring(0, 20)}...`);
        return false; // Signal that token should be deleted
      }

      this.logger.error(`Failed to send notification: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Send push notification to multiple device tokens
   */
  async sendMulticast(
    tokens: string[],
    payload: PushNotificationPayload,
  ): Promise<{ successCount: number; failureCount: number; invalidTokens: string[] }> {
    if (tokens.length === 0) {
      return { successCount: 0, failureCount: 0, invalidTokens: [] };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.icon,
        },
        data: payload.data || {},
        webpush: payload.clickAction
          ? {
              fcmOptions: {
                link: payload.clickAction,
              },
            }
          : undefined,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      
      // Collect invalid tokens
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const error = resp.error?.message || '';
          if (
            error.includes('registration-token-not-registered') ||
            error.includes('invalid-registration-token')
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });

      this.logger.log(
        `Multicast sent: ${response.successCount} successful, ${response.failureCount} failed, ${invalidTokens.length} invalid tokens`,
      );

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        invalidTokens,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send multicast: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(
    topic: string,
    payload: PushNotificationPayload,
  ): Promise<void> {
    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.icon,
        },
        data: payload.data || {},
        webpush: payload.clickAction
          ? {
              fcmOptions: {
                link: payload.clickAction,
              },
            }
          : undefined,
      };

      await admin.messaging().send(message);
      this.logger.log(`Notification sent to topic: ${topic}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send to topic ${topic}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Subscribe tokens to a topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    try {
      await admin.messaging().subscribeToTopic(tokens, topic);
      this.logger.log(`Subscribed ${tokens.length} tokens to topic: ${topic}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to subscribe to topic ${topic}: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Unsubscribe tokens from a topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    try {
      await admin.messaging().unsubscribeFromTopic(tokens, topic);
      this.logger.log(`Unsubscribed ${tokens.length} tokens from topic: ${topic}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to unsubscribe from topic ${topic}: ${errorMessage}`);
      throw error;
    }
  }
}
