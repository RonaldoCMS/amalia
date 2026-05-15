#!/usr/bin/env node

/**
 * Firebase Admin JSON to .env Converter
 * 
 * Usage:
 *   node scripts/firebase-json-to-env.js path/to/firebase_admin.json
 * 
 * This script reads a Firebase Admin service account JSON file
 * and outputs the environment variables needed for .env file.
 */

const fs = require('fs');
const path = require('path');

// Get JSON file path from command line
const jsonFilePath = process.argv[2];

if (!jsonFilePath) {
  console.error('❌ Error: Please provide path to firebase_admin.json');
  console.log('\nUsage:');
  console.log('  node scripts/firebase-json-to-env.js path/to/firebase_admin.json');
  console.log('\nExample:');
  console.log('  node scripts/firebase-json-to-env.js apps/backend/firebase_admin.json');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(jsonFilePath)) {
  console.error(`❌ Error: File not found: ${jsonFilePath}`);
  process.exit(1);
}

try {
  // Read and parse JSON
  const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
  const serviceAccount = JSON.parse(jsonContent);

  // Extract storage bucket from project_id
  const storageBucket = `${serviceAccount.project_id}.firebasestorage.app`;

  // Generate .env variables
  console.log('');
  console.log('# ========================================');
  console.log('# Firebase Admin SDK Environment Variables');
  console.log('# ========================================');
  console.log('# Copy these lines to your .env file');
  console.log('# Then DELETE the JSON file for security');
  console.log('# ========================================');
  console.log('');
  console.log('# Required Firebase Variables');
  console.log(`FIREBASE_TYPE=${serviceAccount.type || 'service_account'}`);
  console.log(`FIREBASE_PROJECT_ID=${serviceAccount.project_id}`);
  console.log(`FIREBASE_PRIVATE_KEY_ID=${serviceAccount.private_key_id}`);
  console.log(`FIREBASE_PRIVATE_KEY="${serviceAccount.private_key}"`);
  console.log(`FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`);
  console.log(`FIREBASE_CLIENT_ID=${serviceAccount.client_id}`);
  console.log(`FIREBASE_CLIENT_CERT_URL=${serviceAccount.client_x509_cert_url}`);
  console.log(`FIREBASE_STORAGE_BUCKET=${storageBucket}`);
  console.log('');
  console.log('# Optional (defaults provided if omitted)');
  console.log(`FIREBASE_AUTH_URI=${serviceAccount.auth_uri || 'https://accounts.google.com/o/oauth2/auth'}`);
  console.log(`FIREBASE_TOKEN_URI=${serviceAccount.token_uri || 'https://oauth2.googleapis.com/token'}`);
  console.log(`FIREBASE_AUTH_PROVIDER_CERT_URL=${serviceAccount.auth_provider_x509_cert_url || 'https://www.googleapis.com/oauth2/v1/certs'}`);
  console.log(`FIREBASE_UNIVERSE_DOMAIN=${serviceAccount.universe_domain || 'googleapis.com'}`);
  console.log('');
  console.log('# ========================================');
  console.log('✅ Conversion complete!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Copy the variables above to your .env file');
  console.log('2. Make sure FIREBASE_PRIVATE_KEY keeps the quotes and \\n');
  console.log('3. DELETE the JSON file: rm ' + jsonFilePath);
  console.log('4. Restart your backend: npm run start:dev');
  console.log('# ========================================');
  console.log('');

} catch (error) {
  console.error('❌ Error reading or parsing JSON file:', error.message);
  process.exit(1);
}
