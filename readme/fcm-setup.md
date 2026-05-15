# Firebase Cloud Messaging (FCM) - Configuration Guide

## Overview
This application uses Firebase Cloud Messaging (FCM) to send push notifications to users in real-time.

## Architecture

### Frontend
- **Firebase SDK**: Initializes messaging client (`lib/firebase.ts`)
- **Service Worker**: Handles background notifications (`public/firebase-messaging-sw.js`)
- **useFCM Hook**: Manages FCM token, permissions, and foreground messages (`hooks/useFCM.ts`)
- **NotificationContext**: Integrates FCM with app-wide notification system

### Backend
- **Firebase Admin SDK**: Sends push notifications to devices
- **FCMToken Entity**: Stores user device tokens in database
- **FCMTokenRepository**: Manages token CRUD operations
- **FirebaseMessagingService**: Sends notifications via FCM
- **NotificationService**: Enhanced to send both database + push notifications

---

## Setup Instructions

### 1. Firebase Console Configuration

#### a. Generate Service Account Credentials
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **amalia-1d651**
3. Navigate to **Project Settings** (gear icon) → **Service Accounts**
4. Click **Generate New Private Key** → Download JSON file
5. Open the downloaded JSON file and copy the values to your `.env` file:

```bash
# Backend .env file (apps/backend/.env or root .env)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=amalia-1d651
FIREBASE_PRIVATE_KEY_ID=<copy from JSON: private_key_id>
FIREBASE_PRIVATE_KEY="<copy from JSON: private_key - keep the quotes and \n>"
FIREBASE_CLIENT_EMAIL=<copy from JSON: client_email>
FIREBASE_CLIENT_ID=<copy from JSON: client_id>
FIREBASE_CLIENT_CERT_URL=<copy from JSON: client_x509_cert_url>
FIREBASE_STORAGE_BUCKET=amalia-1d651.firebasestorage.app

# Optional (defaults provided if omitted)
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

**Important**: 
- Keep the quotes around `FIREBASE_PRIVATE_KEY` value
- The private key contains `\n` characters - do NOT remove them
- **NEVER commit the `.env` file to Git** (it's already in `.gitignore`)

#### b. Enable Firebase Cloud Messaging
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **amalia-1d651**
3. Navigate to **Build → Cloud Messaging**
4. If not already enabled, enable Cloud Messaging

#### b. Generate VAPID Key (Web Push Certificate)
1. In **Cloud Messaging** settings, scroll to **Web configuration**
2. Under **Web Push certificates**, click **Generate key pair**
3. Copy the generated key (starts with `B...`)

### 2. Frontend Configuration

#### Update VAPID Key and Firebase Config in .env.local
File: `apps/frontend/.env.local`

```bash
# Backend URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# Firebase Web Configuration (from Firebase Console > Project Settings > General > Your apps)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Firebase Cloud Messaging VAPID Key (from Firebase Console > Cloud Messaging > Web Push certificates)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key-here
```

**Steps to get VAPID key:**

1. In **Cloud Messaging** settings, scroll to **Web configuration**
2. Under **Web Push certificates**, click **Generate key pair** (if not already generated)
3. Copy the generated key (starts with `B...`)
4. Paste it as `NEXT_PUBLIC_FIREBASE_VAPID_KEY` value in `.env.local`

**Steps to get Firebase Web Config:**

1. In **Project Settings**, scroll to **Your apps** section
2. Select your Web app (or create one if it doesn't exist)
3. Copy the config values to the corresponding `NEXT_PUBLIC_FIREBASE_*` variables

**Important**: 
- The `.env.local` file is already in `.gitignore` and won't be committed
- All Firebase configuration is now stored in environment variables, not in `firebase.json`
- Use `apps/frontend/.env.example` as a template

### 3. Backend Configuration

#### Verify Environment Variables
Ensure all Firebase variables are set in your backend `.env` file (see step 1a above).

The backend now loads credentials from environment variables instead of `firebase_admin.json` file for better security.

### 4. Environment Variables (Optional)

Add to backend `.env` file for click actions:

```env
FRONTEND_URL=https://your-production-domain.com
```

This determines where push notifications redirect users when clicked.

---

## Database Migration

A new table `fcm_tokens` will be automatically created by TypeORM on next backend startup:

```sql
CREATE TABLE fcm_tokens (
  id UUID PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  token TEXT NOT NULL UNIQUE,
  device_info TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE UNIQUE INDEX idx_fcm_tokens_token ON fcm_tokens(token);
```

---

## How It Works

### Token Registration Flow
1. User logs in → Frontend requests notification permission
2. If granted → FCM token is generated by Firebase SDK
3. Token is sent to backend via `POST /notifications/fcm-token`
4. Backend stores token in `fcm_tokens` table linked to user

### Notification Sending Flow
1. Backend service calls `notificationService.notify(userId, type, title, body)`
2. Notification is saved to database (for notification bell)
3. FCM tokens for user are retrieved from database
4. Push notification is sent to all user devices via `firebaseMessagingService.sendMulticast()`
5. Invalid/expired tokens are automatically removed

### Notification Reception Flow
- **App Open (Foreground)**: `onForegroundMessage()` in NotificationContext shows snackbar
- **App Closed (Background)**: Service worker (`firebase-messaging-sw.js`) shows browser notification

---

## API Endpoints

### Register FCM Token
```http
POST /notifications/fcm-token
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "token": "fcm-token-string",
  "deviceInfo": "Chrome 131 on Windows"
}
```

### Delete FCM Token (on logout)
```http
DELETE /notifications/fcm-token
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "token": "fcm-token-string"
}
```

---

## Testing

### 1. Request Permission
Open browser console and check for:
```
✅ FCM token registered with backend
```

### 2. Trigger Test Notification
From backend, call any service that triggers notifications, e.g.:
- Send a message → triggers `notify(userId, 'message', ...)`
- Create a match → triggers `notify(userId, 'match', ...)`
- Like a post → triggers `notify(userId, 'like', ...)`

### 3. Verify Delivery
- **Foreground**: Check if snackbar appears in bottom-left
- **Background**: Close browser tab, trigger notification, check system notification

---

## Troubleshooting

### Permission Denied
- User blocked notifications → Guide them to browser settings to re-enable
- Fallback: Polling system (8-second interval) still works

### Token Not Registering
- Check browser console for errors
- Verify Firebase config in `lib/firebase.ts` matches Firebase Console
- Ensure VAPID key is correctly set in `useFCM.ts`

### Notifications Not Received
- Check backend logs for FCM errors
- Verify `firebase_admin.json` exists and has correct permissions
- Check if token exists in database: `SELECT * FROM fcm_tokens WHERE user_id = '...'`

### Invalid Token Errors
- Old tokens are automatically cleaned up by `firebaseMessagingService.sendMulticast()`
- Manual cleanup: `DELETE FROM fcm_tokens WHERE updated_at < NOW() - INTERVAL '90 days'`

---

## Security Notes

1. **VAPID Key**: Public key, safe to commit (but we store it in code)
2. **Service Account Key**: Private key in `firebase_admin.json` → **NEVER commit**
3. **FCM Tokens**: Sensitive, stored in database with user relationship
4. **Permissions**: Only authenticated users can register tokens (JWT protected)

---

## Future Enhancements

- [ ] Add support for notification topics (e.g., subscribe to "new-jobs")
- [ ] Implement rich notifications with images and actions
- [ ] Add notification preference settings (per notification type)
- [ ] Implement token rotation/refresh mechanism
- [ ] Add analytics for notification delivery rates
