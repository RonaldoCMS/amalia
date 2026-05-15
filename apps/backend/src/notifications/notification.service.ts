import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from '../shared/repositories/pg/notification.repository';
import { FCMTokenRepository } from '../shared/repositories/pg/fcm-token.repository';
import { FirebaseMessagingService } from '../shared/firebase/firebase-messaging.service';
import { NotificationItem, NotificationType } from '@amalia/shared';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly fcmTokenRepository: FCMTokenRepository,
    private readonly firebaseMessagingService: FirebaseMessagingService,
  ) {}

  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const items = await this.notificationRepository.getByUser(userId)
    return items.map(n => ({
      id: n.id,
      type: n.type as NotificationType,
      title: n.title,
      body: n.body,
      referenceId: n.referenceId,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }))
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.getUnreadCount(userId)
    return { count }
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllRead(userId)
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.notificationRepository.markRead(id, userId)
  }

  /** Chiamata internamente da altri servizi */
  async notify(userId: string, type: NotificationType, title: string, body: string, referenceId?: string): Promise<void> {
    // Save to database
    await this.notificationRepository.create(userId, type, title, body, referenceId);

    // Send push notification to all user devices
    try {
      const tokens = await this.fcmTokenRepository.getUserTokens(userId);
      
      if (tokens.length > 0) {
        const clickAction = this.getClickActionUrl(type, referenceId);
        
        const result = await this.firebaseMessagingService.sendMulticast(tokens, {
          title,
          body,
          data: {
            type,
            referenceId: referenceId || '',
          },
          clickAction,
        });

        // Clean up invalid tokens
        if (result.invalidTokens.length > 0) {
          this.logger.log(`Removing ${result.invalidTokens.length} invalid FCM tokens`);
          for (const token of result.invalidTokens) {
            await this.fcmTokenRepository.deleteToken(token);
          }
        }
      }
    } catch (error) {
      // Log error but don't fail the notification creation
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send push notification to user ${userId}: ${errorMessage}`);
    }
  }

  private getClickActionUrl(type: NotificationType, referenceId?: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    switch (type) {
      case 'match':
        return `${baseUrl}/match`;
      case 'message':
        return referenceId ? `${baseUrl}/chat/${referenceId}` : `${baseUrl}/chat`;
      case 'like':
        return referenceId ? `${baseUrl}/feed?postId=${referenceId}` : `${baseUrl}/feed`;
      case 'comment':
        return referenceId ? `${baseUrl}/feed?postId=${referenceId}` : `${baseUrl}/feed`;
      case 'friendship':
        return `${baseUrl}/profile`;
      case 'challenge':
        return referenceId ? `${baseUrl}/challenge/${referenceId}` : `${baseUrl}/challenge`;
      case 'duel':
        return referenceId ? `${baseUrl}/duel/${referenceId}` : `${baseUrl}/duel`;
      case 'job':
        return referenceId ? `${baseUrl}/jobs/${referenceId}` : `${baseUrl}/jobs`;
      // Moderation
      case NotificationType.ReportSubmitted:
        return referenceId ? `${baseUrl}/admin/reports?id=${referenceId}` : `${baseUrl}/admin/reports`;
      case NotificationType.ReportResolved:
        return `${baseUrl}/profile`;
      case NotificationType.UserBanned:
      case NotificationType.UserUnbanned:
      case NotificationType.UserMuted:
      case NotificationType.UserUnmuted:
        return `${baseUrl}/profile`;
      case NotificationType.PostDeletedByMod:
      case NotificationType.CommentDeletedByMod:
        return `${baseUrl}/feed`;
      case NotificationType.MessageDeletedByMod:
        return `${baseUrl}/chat`;
      case NotificationType.RoleAssigned:
      case NotificationType.RoleRemoved:
      case NotificationType.PermissionGranted:
      case NotificationType.PermissionRevoked:
        return `${baseUrl}/profile`;
      default:
        return baseUrl;
    }
  }
}
