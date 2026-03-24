#!/usr/bin/env node

/**
 * Generate Firebase Service Worker from template
 * 
 * This script reads firebase-messaging-sw.template.js and replaces
 * placeholders with environment variables from .env.local
 * 
 * Run this before starting the dev server or building for production
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const templatePath = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.template.js');
const outputPath = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.js');

console.log('🔧 Generating firebase-messaging-sw.js from template...');

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env.local file not found');
  console.log('Please create apps/frontend/.env.local with Firebase configuration');
  process.exit(1);
}

// Parse .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
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
  console.warn('Please add these to your .env.local file');
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
