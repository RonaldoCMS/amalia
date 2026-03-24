import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';
import firebaseConfig from '../firebase.json';

let app: FirebaseApp | undefined;
let messaging: Messaging | undefined;

/**
 * Initialize Firebase App
 */
export const initializeFirebase = (): FirebaseApp => {
  if (!app) {
    // Check if Firebase is already initialized
    const apps = getApps();
    if (apps.length > 0) {
      app = apps[0];
    } else {
      app = initializeApp(firebaseConfig);
    }
  }
  return app;
};

/**
 * Get Firebase Messaging instance
 * Returns undefined if messaging is not supported (e.g., iOS Safari)
 */
export const getFirebaseMessaging = async (): Promise<Messaging | undefined> => {
  if (typeof window === 'undefined') {
    // Server-side rendering
    return undefined;
  }

  try {
    // Check if FCM is supported
    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase Messaging is not supported in this browser');
      return undefined;
    }

    if (!messaging) {
      const firebaseApp = initializeFirebase();
      messaging = getMessaging(firebaseApp);
    }

    return messaging;
  } catch (error) {
    console.error('Failed to initialize Firebase Messaging:', error);
    return undefined;
  }
};

/**
 * Check if push notifications are supported
 */
export const isPushNotificationSupported = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    const supported = await isSupported();
    return supported && 'Notification' in window && 'serviceWorker' in navigator;
  } catch {
    return false;
  }
};
