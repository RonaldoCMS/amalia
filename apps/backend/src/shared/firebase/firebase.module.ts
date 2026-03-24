import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseStorageService } from './firebase-storage.service';
import { FirebaseMessagingService } from './firebase-messaging.service';

// Firebase Admin SDK initialization
const firebaseProvider = {
  provide: 'FIREBASE_APP',
  useFactory: () => {
    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      // Build service account from environment variables
      const serviceAccount = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle escaped newlines
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || 'googleapis.com',
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'amalia-1d651.firebasestorage.app',
      });
      
      console.log('✅ Firebase Admin SDK initialized from environment variables');
    }

    return admin.app();
  },
};

@Global()
@Module({
  providers: [firebaseProvider, FirebaseStorageService, FirebaseMessagingService],
  exports: [FirebaseStorageService, FirebaseMessagingService],
})
export class FirebaseModule {}
