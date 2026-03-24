import { Global, Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseStorageService } from './firebase-storage.service';
import { FirebaseMessagingService } from './firebase-messaging.service';
import * as path from 'path';

// Firebase Admin SDK initialization
const firebaseProvider = {
  provide: 'FIREBASE_APP',
  useFactory: () => {
    const serviceAccountPath = path.join(
      __dirname,
      '../../../firebase_admin.json',
    );

    // Initialize Firebase Admin SDK if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        storageBucket: 'amalia-1d651.firebasestorage.app',
      });
      console.log('✅ Firebase Admin SDK initialized');
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
