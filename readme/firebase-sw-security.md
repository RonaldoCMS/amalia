# Firebase Service Worker Security Guide

## Problem
Google flagged the repository for having Firebase credentials exposed in:
- `firebase.json` - Web app configuration
- `firebase-messaging-sw.js` - Service worker with hardcoded config
- `useFCM.ts` - VAPID key hardcoded in source

Even though these are "public" credentials (client-side), Google's automated security scanner flags them as sensitive.

---

## Solution Implemented

### 1. Environment Variables for All Firebase Config

**Backend** (`apps/backend/.env`):
- All Firebase Admin SDK credentials moved to env vars
- No more `firebase_admin.json` file

**Frontend** (`apps/frontend/.env.local`):
- All Firebase web config moved to env vars
- VAPID key moved to env var
- No more `firebase.json` file

### 2. Auto-Generated Service Worker

**Problem**: Service workers are static files served from `/public` - they cannot access `process.env` at runtime.

**Solution**: Generate `firebase-messaging-sw.js` from a template during build/dev:

1. **Template**: `public/firebase-messaging-sw.template.js`
   - Contains placeholders like `__FIREBASE_API_KEY__`
   - Safe to commit to Git

2. **Generator Script**: `scripts/generate-sw.js`
   - Reads `.env.local`
   - Replaces placeholders with actual values
   - Writes `public/firebase-messaging-sw.js`

3. **Automatic Execution**:
   ```json
   "scripts": {
     "predev": "npm run generate-sw",
     "prebuild": "npm run generate-sw"
   }
   ```
   - Runs automatically before `npm run dev` and `npm run build`

4. **Git Ignore**: `firebase-messaging-sw.js` is ignored (auto-generated, contains credentials)

---

## Files Modified

### Created
- ✅ `apps/frontend/.env.example` - Template for environment variables
- ✅ `apps/frontend/public/firebase-messaging-sw.template.js` - Service worker template
- ✅ `apps/frontend/scripts/generate-sw.js` - Generator script
- ✅ `readme/firebase-env-migration.md` - Backend credentials migration guide
- ✅ `readme/firebase-sw-security.md` - This file

### Modified
- ✅ `apps/frontend/lib/firebase.ts` - Read config from `process.env` instead of `firebase.json`
- ✅ `apps/frontend/hooks/useFCM.ts` - Read VAPID key from `process.env`
- ✅ `apps/frontend/package.json` - Added `generate-sw` scripts
- ✅ `apps/backend/src/shared/firebase/firebase.module.ts` - Read from env vars
- ✅ `.gitignore` - Added generated files and credential files
- ✅ `readme/fcm-setup.md` - Updated configuration instructions
- ✅ `readme/fcm-implementation-changelog.md` - Updated setup guide

### Ignored (Generated/Credentials)
- 🔒 `apps/frontend/.env.local` - Contains Firebase config
- 🔒 `apps/frontend/firebase.json` - Replaced by env vars (can be deleted)
- 🔒 `apps/frontend/public/firebase-messaging-sw.js` - Auto-generated from template
- 🔒 `apps/backend/firebase_admin.json` - Replaced by env vars (can be deleted)
- 🔒 `apps/backend/.env` / `.env` - Contains Firebase admin credentials

---

## Setup Instructions

### First Time Setup

1. **Copy environment template**:
   ```bash
   cd apps/frontend
   cp .env.example .env.local
   ```

2. **Get Firebase Web Config**:
   - Firebase Console → Project Settings → Your apps → Web app
   - Copy all config values to `.env.local`:
     ```bash
     NEXT_PUBLIC_FIREBASE_API_KEY=...
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
     NEXT_PUBLIC_FIREBASE_APP_ID=...
     NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
     ```

3. **Get VAPID Key**:
   - Firebase Console → Cloud Messaging → Web Push certificates
   - Generate key pair (if not exists)
   - Copy key to `.env.local`:
     ```bash
     NEXT_PUBLIC_FIREBASE_VAPID_KEY=B...
     ```

4. **Generate Service Worker**:
   ```bash
   npm run generate-sw
   ```
   This creates `public/firebase-messaging-sw.js` with your credentials.

5. **Start Development**:
   ```bash
   npm run dev  # Automatically runs generate-sw first
   ```

### Existing Project

If you already have `firebase.json` or hardcoded values:

1. **Backup existing credentials**:
   ```bash
   # Save for reference
   cp public/firebase-messaging-sw.js firebase-messaging-sw.backup.js
   cp firebase.json firebase.backup.json
   ```

2. **Fill .env.local** with values from backed up files

3. **Generate new service worker**:
   ```bash
   npm run generate-sw
   ```

4. **Delete old files** (optional, they're already gitignored):
   ```bash
   rm firebase.json firebase-messaging-sw.backup.js firebase.backup.json
   ```

---

## Deployment

### Development
```bash
npm run dev  # Automatically generates service worker
```

### Production Build
```bash
npm run build  # Automatically generates service worker
npm start
```

### CI/CD (GitHub Actions, Vercel, etc.)

Set environment variables in your deployment platform:

**Frontend Variables** (Vercel/Netlify/etc.):
```
NEXT_PUBLIC_BACKEND_URL=https://api.your-domain.com
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
```

The build process will automatically generate the service worker with these values.

#### Vercel Setup (Step-by-step)

1. **Go to your Vercel project** → Settings → Environment Variables

2. **Add all Firebase variables**:
   - Click "Add New"
   - Enter key: `NEXT_PUBLIC_FIREBASE_API_KEY`
   - Enter value: `AIzaSy...` (your actual API key)
   - Select environments: Production, Preview, Development
   - Click "Save"
   
3. **Repeat for all 9 variables**:
   ```
   NEXT_PUBLIC_BACKEND_URL
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
   NEXT_PUBLIC_FIREBASE_VAPID_KEY
   ```

4. **Redeploy** (if already deployed):
   - Go to Deployments tab
   - Click "..." on latest deployment → Redeploy
   - Or push a new commit

5. **Verify** service worker generation in build logs:
   ```
   📦 Using environment variables from process.env (production mode)
   ✅ firebase-messaging-sw.js generated successfully
   ✅ All Firebase environment variables are configured
   ```

**Backend Variables** (Railway/Render/etc.):
See [firebase-env-migration.md](firebase-env-migration.md)

---

## Security Benefits

### Before (❌ Flagged by Google)
```javascript
// useFCM.ts
const VAPID_KEY = 'BLiH_2bkbUgVnKk0Z0iySRjw3r0hrLmjN5oR5p8th5uWr9TEsvxBv4qX1nqEqrQEotSEyOtm2L_WkUgSDkMoSj0';

// firebase.json
{
  "apiKey": "AIzaSyBW0av7SMOhLemxfjWuAwQ6Sm_nIRh2sXA",
  ...
}

// firebase-messaging-sw.js
firebase.initializeApp({
  apiKey: "AIzaSyBW0av7SMOhLemxfjWuAwQ6Sm_nIRh2sXA",
  ...
});
```
→ **All committed to Git** → Scanned by Google → Flagged

### After (✅ Secure)
```javascript
// useFCM.ts
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// firebase.json (deleted or gitignored)

// firebase-messaging-sw.js (auto-generated, gitignored)

// .env.local (gitignored)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
```
→ **Nothing sensitive in Git** → No automated flags

---

## Troubleshooting

### Build Error on Vercel: ".env.local file not found"
**Cause**: The script was looking for `.env.local` which doesn't exist in production.

**Solution**: Already fixed! The script now uses `process.env` in production. Make sure:
1. All `NEXT_PUBLIC_FIREBASE_*` variables are set in Vercel dashboard
2. Redeploy after adding environment variables
3. Check build logs for: `📦 Using environment variables from process.env (production mode)`

### Service Worker Not Working
```bash
# Regenerate manually
npm run generate-sw

# Check if .env.local has all variables (local dev)
cat .env.local | grep FIREBASE

# Or check Vercel environment variables (production)
```

### "VAPID key not configured" Error
- **Local Dev**: Check `.env.local` has `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
- **Production**: Check Vercel/platform has the variable configured
- Restart dev server: `npm run dev`

### Missing Environment Variables Warning
```
⚠️  Warning: Missing environment variables:
   - FIREBASE API KEY
```
→ **Local**: Add to `.env.local` and regenerate:
```bash
npm run generate-sw
```
→ **Production**: Add to Vercel/platform dashboard and redeploy

### Git Still Shows firebase-messaging-sw.js
```bash
# Remove from Git cache
git rm --cached apps/frontend/public/firebase-messaging-sw.js

# Commit the removal
git commit -m "Remove generated service worker from git"
```

---

## Why This Approach?

### Alternative Approaches Considered

1. **❌ Keep credentials in code**
   - Flagged by Google's security scanner
   - Not acceptable for public repositories

2. **❌ Fetch config from backend endpoint**
   - Adds latency to service worker initialization
   - Service worker can't make fetch calls during registration
   - Overcomplicated

3. **❌ Use environment variables directly in service worker**
   - Service workers are static files in `/public`
   - Cannot access `process.env` at runtime
   - Would require complex webpack/Next.js configuration

4. **✅ Template + Generation Script**
   - Simple Node.js script
   - Runs automatically before dev/build
   - Generated file is gitignored
   - Clean separation of template (committed) vs. credentials (gitignored)
   - Standard practice in many projects (e.g., Dockerfile templates)

---

## Best Practices

✅ **Do**:
- Keep `.env.local` in `.gitignore`
- Use `.env.example` as documentation
- Run `generate-sw` before starting dev server (automatic with `predev` script)
- Commit templates, not generated files
- Set environment variables in deployment platforms

❌ **Don't**:
- Commit `.env.local` or `.env`
- Commit `firebase-messaging-sw.js`
- Commit `firebase.json` with real credentials
- Hardcode credentials in source code
- Share credentials in public channels

---

## Summary

| Item | Before | After |
|------|--------|-------|
| **VAPID Key** | Hardcoded in `useFCM.ts` | In `.env.local` |
| **Firebase Config** | `firebase.json` (committed) | `.env.local` (gitignored) |
| **Service Worker** | Hardcoded credentials | Auto-generated from template |
| **Backend Credentials** | `firebase_admin.json` | `.env` variables |
| **Security** | ❌ Flagged by Google | ✅ No sensitive data in Git |
| **Setup Complexity** | Simple (just commit files) | One-time env setup + auto-generation |

The small increase in setup complexity is worth it for:
- ✅ No security warnings from Google
- ✅ Proper credential management
- ✅ Production-ready deployment practices
- ✅ Different credentials per environment (dev/staging/prod)
