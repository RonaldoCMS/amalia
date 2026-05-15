#!/usr/bin/env node

/**
 * Generate Firebase Service Worker from template
 * 
 * This script reads firebase-messaging-sw.template.js and replaces
 * placeholders with environment variables.
 * 
 * Works in both local dev (reads .env.local) and production (uses process.env from Vercel/Railway/etc.)
 * 
 * Run this before starting the dev server or building for production
 */

const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.template.js');
const outputPath = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.js');

console.log('🔧 Generating firebase-messaging-sw.js from template...');

// Load environment variables
// Priority: process.env (for production) > .env.local (for local dev)
const env = {};

// First, try to load from .env.local (local development)
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  console.log('📄 Loading from .env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, ''); // Remove quotes
      }
    }
  });
} else {
  console.log('📦 Using environment variables from process.env (production mode)');
}

// Override with process.env (always takes priority - for Vercel/Railway/etc.)
Object.keys(process.env).forEach(key => {
  if (key.startsWith('NEXT_PUBLIC_FIREBASE_')) {
    env[key] = process.env[key];
  }
});

// Read template
if (!fs.existsSync(templatePath)) {
  console.error('❌ Error: firebase-messaging-sw.template.js not found');
  process.exit(1);
}

let template = fs.readFileSync(templatePath, 'utf8');

// Replace placeholders
const replacements = {
  '__FIREBASE_API_KEY__': env.NEXT_PUBLIC_FIREBASE_API_KEY,
  '__FIREBASE_AUTH_DOMAIN__': env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  '__FIREBASE_PROJECT_ID__': env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  '__FIREBASE_STORAGE_BUCKET__': env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  '__FIREBASE_MESSAGING_SENDER_ID__': env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  '__FIREBASE_APP_ID__': env.NEXT_PUBLIC_FIREBASE_APP_ID,
  '__FIREBASE_MEASUREMENT_ID__': env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if all required vars are present
const missing = [];
for (const [placeholder, value] of Object.entries(replacements)) {
  if (!value || value === 'undefined') {
    missing.push(placeholder.replace(/__/g, '').replace(/_/g, ' '));
  }
  template = template.replace(placeholder, value || '');
}

if (missing.length > 0) {
  console.warn('⚠️  Warning: Missing environment variables:');
  missing.forEach(m => console.warn(`   - ${m}`));
  console.warn('In local dev: Add these to .env.local');
  console.warn('In production: Configure these in your hosting platform (Vercel/Railway/etc.)');
}

// Write output
fs.writeFileSync(outputPath, template, 'utf8');
console.log('✅ firebase-messaging-sw.js generated successfully');
console.log(`   Template: ${path.relative(process.cwd(), templatePath)}`);
console.log(`   Output:   ${path.relative(process.cwd(), outputPath)}`);

if (missing.length === 0) {
  console.log('✅ All Firebase environment variables are configured');
} else {
  console.log('⚠️  Service worker generated with missing values - FCM may not work correctly');
}
