import { useEffect, useState, useCallback } from 'react';
import { getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { getFirebaseMessaging, isPushNotificationSupported } from '../lib/firebase';
import { supportsIOSWebPush } from '../lib/ios-pwa';
import { FCMTokenRepository } from '../repositories/fcm-token.repository';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const IOS_VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const FCM_TOKEN_KEY = 'fcm-token';
const FCM_PERMISSION_ASKED_KEY = 'fcm-permission-asked';
const WEB_PUSH_ENDPOINT_KEY = 'web-push-endpoint';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const buffer = new ArrayBuffer(raw.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i)
  return buffer
}

export interface UseFCMResult {
  token: string | null;
  isSupported: boolean;
  permissionStatus: NotificationPermission | null;
  requestPermission: () => Promise<boolean>;
  hasAskedPermission: boolean;
  onForegroundMessage: (callback: (payload: MessagePayload) => void) => () => void;
}

/**
 * Hook for Firebase Cloud Messaging
 * Handles FCM token registration, permission requests, and foreground messages
 */
export const useFCM = (): UseFCMResult => {
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);
  const [hasAskedPermission, setHasAskedPermission] = useState(false);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      const supported = await isPushNotificationSupported();
      setIsSupported(supported);

      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPermissionStatus(Notification.permission);
      }

      // Check if we've already asked for permission
      const asked = localStorage.getItem(FCM_PERMISSION_ASKED_KEY) === 'true';
      setHasAskedPermission(asked);
    };

    checkSupport();
  }, []);

  // Get existing token / subscription
  useEffect(() => {
    const getExistingToken = async () => {
      if (!isSupported || permissionStatus !== 'granted') return;

      try {
        // iOS PWA path: use standard Web Push
        if (supportsIOSWebPush()) {
          const storedEndpoint = localStorage.getItem(WEB_PUSH_ENDPOINT_KEY);
          if (storedEndpoint) {
            setToken(storedEndpoint);
            return;
          }
          if (!IOS_VAPID_PUBLIC_KEY) return;
          const swReg = await navigator.serviceWorker.getRegistration();
          if (!swReg) return;
          const existing = await swReg.pushManager.getSubscription();
          if (existing) {
            localStorage.setItem(WEB_PUSH_ENDPOINT_KEY, existing.endpoint);
            setToken(existing.endpoint);
            await FCMTokenRepository.registerWebPushSubscription(existing).catch(() => {});
          }
          return;
        }

        // Non-iOS: FCM path
        const storedToken = localStorage.getItem(FCM_TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          return;
        }

        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        const swReg = 'serviceWorker' in navigator
          ? await navigator.serviceWorker.getRegistration()
          : undefined
        const currentToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          ...(swReg && { serviceWorkerRegistration: swReg }),
        });

        if (currentToken) {
          setToken(currentToken);
          localStorage.setItem(FCM_TOKEN_KEY, currentToken);
        }
      } catch (error) {
        console.error('Error getting token:', error);
      }
    };

    getExistingToken();
  }, [isSupported, permissionStatus]);

  /**
   * Request notification permission and get FCM token
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications are not supported');
      return false;
    }

    if (!VAPID_KEY) {
      console.error('VAPID key not configured. Set NEXT_PUBLIC_FIREBASE_VAPID_KEY in .env.local');
      return false;
    }

    try {
      // Mark that we've asked for permission
      localStorage.setItem(FCM_PERMISSION_ASKED_KEY, 'true');
      setHasAskedPermission(true);

      // Request permission
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      // iOS PWA: subscribe via standard Web Push
      if (supportsIOSWebPush()) {
        if (!IOS_VAPID_PUBLIC_KEY) {
          console.error('NEXT_PUBLIC_VAPID_PUBLIC_KEY not set — iOS Web Push disabled');
          return false;
        }
        const swReg = await navigator.serviceWorker.getRegistration();
        if (!swReg) { console.error('No SW registration'); return false; }
        const subscription = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(IOS_VAPID_PUBLIC_KEY),
        });
        localStorage.setItem(WEB_PUSH_ENDPOINT_KEY, subscription.endpoint);
        setToken(subscription.endpoint);
        await FCMTokenRepository.registerWebPushSubscription(subscription);
        return true;
      }

      // Non-iOS: FCM
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        console.error('Failed to get messaging instance');
        return false;
      }

      const swReg = 'serviceWorker' in navigator
        ? await navigator.serviceWorker.getRegistration()
        : undefined
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        ...(swReg && { serviceWorkerRegistration: swReg }),
      });

      if (currentToken) {
        setToken(currentToken);
        localStorage.setItem(FCM_TOKEN_KEY, currentToken);
        return true;
      } else {
        console.error('No registration token available');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  /**
   * Listen to foreground messages
   * Returns unsubscribe function
   */
  const onForegroundMessage = useCallback(
    (callback: (payload: MessagePayload) => void) => {
      let unsubscribe: (() => void) | undefined;

      const setupListener = async () => {
        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        unsubscribe = onMessage(messaging, (payload) => {
          console.log('Foreground message received:', payload);
          callback(payload);
        });
      };

      setupListener();

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    },
    []
  );

  return {
    token,
    isSupported,
    permissionStatus,
    requestPermission,
    hasAskedPermission,
    onForegroundMessage,
  };
};
