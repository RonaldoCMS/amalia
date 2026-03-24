# Firebase Environment Variables Migration Guide

## Why Move to Environment Variables?

Previously, Firebase Admin SDK credentials were stored in `firebase_admin.json` file. This has been migrated to environment variables for:
- ✅ Better security (no JSON files with secrets)
- ✅ Easier deployment (just set env vars)
- ✅ Consistent with other secrets (JWT, DB passwords, etc.)
- ✅ No risk of accidentally committing credentials

---

## How to Get Firebase Credentials

### Step 1: Download Service Account JSON from Firebase Console

1. Go to [Firebase Console](https://console.firebase.com)
2. Select project: **amalia-1d651**
3. Click **⚙️ Settings** → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the downloaded JSON file temporarily (you'll delete it after copying values)

### Step 2: Extract Values from JSON

The downloaded JSON looks like this:

```json
{
  "type": "service_account",
  "project_id": "amalia-1d651",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@amalia-1d651.iam.gserviceaccount.com",
  "client_id": "1234567890",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/...",
  "universe_domain": "googleapis.com"
}
```

### Step 3: Add to Your `.env` File

**Backend .env** (location: `apps/backend/.env` or root `.env`):

```bash
# Firebase Admin SDK Credentials
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=amalia-1d651
FIREBASE_PRIVATE_KEY_ID=abc123def456...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@amalia-1d651.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=1234567890
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
FIREBASE_STORAGE_BUCKET=amalia-1d651.firebasestorage.app

# Optional (defaults provided, can be omitted)
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

### Step 4: Important Notes

⚠️ **CRITICAL**:
- Keep **quotes around `FIREBASE_PRIVATE_KEY`** → `FIREBASE_PRIVATE_KEY="..."`
- **DO NOT remove `\n` characters** from the private key
- The private key should remain on a single line in the `.env` file

✅ **Security**:
- `.env` file is already in `.gitignore` → will not be committed
- Delete the downloaded JSON file after copying values
- If you have `apps/backend/firebase_admin.json`, you can delete it now

🚀 **Testing**:
```bash
cd apps/backend
npm run start:dev
```

You should see:
```
✅ Firebase Admin SDK initialized from environment variables
```

---

## Deployment (Production)

### Railway / Render / Vercel / etc.

Add these environment variables in your deployment platform dashboard:

```
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=amalia-1d651
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
FIREBASE_CLIENT_CERT_URL=...
FIREBASE_STORAGE_BUCKET=amalia-1d651.firebasestorage.app
```

**Platform-specific tips**:
- **Railway**: Add in Settings → Variables
- **Render**: Add in Environment tab
- **Vercel**: Add in Settings → Environment Variables
- **Docker**: Pass via `docker run -e FIREBASE_...` or `docker-compose.yml` env section

---

## Troubleshooting

### Error: "Failed to initialize Firebase Admin SDK"
- Check that all required env variables are set
- Verify `FIREBASE_PRIVATE_KEY` has quotes and `\n` characters
- Ensure no extra spaces before/after values

### Error: "Invalid service account"
- Re-download the JSON from Firebase Console
- Copy values exactly as they appear (including newlines in private key)
- Make sure `FIREBASE_CLIENT_EMAIL` ends with `@amalia-1d651.iam.gserviceaccount.com`

### Private Key Format Issues
If you see authentication errors, check your private key format:

✅ **Correct** (in .env):
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----\n"
```

❌ **Wrong** (missing quotes):
```bash
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
```

❌ **Wrong** (multiline in .env):
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkq...
-----END PRIVATE KEY-----"
```

---

## Migration Checklist

- [ ] Download service account JSON from Firebase Console
- [ ] Copy all values to `.env` file
- [ ] Verify `FIREBASE_PRIVATE_KEY` has quotes and `\n` preserved
- [ ] Delete the downloaded JSON file
- [ ] Restart backend: `npm run start:dev`
- [ ] Check console for "✅ Firebase Admin SDK initialized from environment variables"
- [ ] Test FCM token registration (login to frontend)
- [ ] Delete `apps/backend/firebase_admin.json` if it exists

---

## Reverting (If Needed)

If you need to go back to JSON file approach:

1. Download service account JSON from Firebase Console
2. Save as `apps/backend/firebase_admin.json`
3. Revert `firebase.module.ts` to use `admin.credential.cert(filePath)`

But this is **not recommended** for security reasons.
