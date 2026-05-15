import { useEffect, useState, useCallback } from 'react';
import { getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { getFirebaseMessaging, isPushNotificationSupported } from '../lib/firebase';

const VAPID_KEY = 'BLiH_2bkbUgVnKk0Z0iySRjw3r0hrLmjN5oR5p8th5uWr9TEsvxBv4qX1nqEqrQEotSEyOtm2L_WkUgSDkMoSj0'; // TODO: Replace with actual VAPID key from Firebase Console
const FCM_TOKEN_KEY = 'fcm-token';
const FCM_PERMISSION_ASKED_KEY = 'fcm-permission-asked';

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

  // Get existing token from localStorage or Firebase
  useEffect(() => {
    const getExistingToken = async () => {
      if (!isSupported || permissionStatus !== 'granted') return;

      try {
        // Check localStorage first
        const storedToken = localStorage.getItem(FCM_TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          return;
        }

        // Get token from Firebase
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
        console.error('Error getting FCM token:', error);
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

      // Get FCM token
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
        console.log('FCM Token:', currentToken);
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
