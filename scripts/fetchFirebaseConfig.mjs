// scripts/fetchFirebaseConfig.mjs
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Required env-vars:
//   GCP_PROJECT_ID   → your GCP project ID
//   FIREBASE_WEB_APP → your Firebase Web App ID (starts with "1:…:web:…")
const { GCP_PROJECT_ID, FIREBASE_WEB_APP } = process.env;

// This function checks if GOOGLE_APPLICATION_CREDENTIALS is set.
// It's a simple way to detect if we're in a configured GCP environment.
function inGcpEnvironment() {
    return !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
}


if (!GCP_PROJECT_ID || !FIREBASE_WEB_APP) {
  console.error(
    '❌ Missing GCP_PROJECT_ID or FIREBASE_WEB_APP in your environment.'
  );
  process.exit(1);
}

async function main() {
  
  // If not in a GCP environment (e.g., local dev), skip the fetch.
  if (!inGcpEnvironment()) {
    console.warn('⚠️ GOOGLE_APPLICATION_CREDENTIALS not set. Skipping Firebase config fetch.');
    console.warn('   Ensure .env.local is populated manually for local development.');
     if (!fs.existsSync(path.resolve(process.cwd(), '.env.local'))) {
      fs.writeFileSync(path.resolve(process.cwd(), '.env.local'), '');
      console.log('✅ Created empty .env.local file.');
    }
    return;
  }

  // Authenticate via Application Default Credentials
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/firebase.readonly']
  });

  const client = await auth.getClient();
  const firebase = google.firebase({ version: 'v1beta1', auth: client });

  // Fetch the web app config in one call
  const res = await firebase.projects.webApps.getConfig({
    name: `projects/${GCP_PROJECT_ID}/webApps/${FIREBASE_WEB_APP}`
  });
  const cfg = res.data;

  // Map to NEXT_PUBLIC_* variables
  const envLines = [
    `NEXT_PUBLIC_FIREBASE_API_KEY=${cfg.apiKey}`,
    `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${cfg.authDomain}`,
    `NEXT_PUBLIC_FIREBASE_PROJECT_ID=${cfg.projectId}`,
    `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${cfg.storageBucket}`,
    `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${cfg.messagingSenderId}`,
    `NEXT_PUBLIC_FIREBASE_APP_ID=${cfg.appId}`,
    `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=${cfg.measurementId || ''}`
  ];

  // Write to .env.local (overwrite each run)
  fs.writeFileSync(
    path.resolve(process.cwd(), '.env.local'),
    envLines.join('\n')
  );

  console.log('✅ .env.local written with Firebase config');
}

main().catch(err => {
  console.error('An error occurred during Firebase config fetch:', err.message);
  // Allow the build to continue in non-GCP environments
  if (!inGcpEnvironment()) {
    console.log('Proceeding with build despite fetch error in non-GCP environment.');
    if (!fs.existsSync(path.resolve(process.cwd(), '.env.local'))) {
      fs.writeFileSync(path.resolve(process.cwd(), '.env.local'), '');
    }
    process.exit(0);
  } else {
     process.exit(1);
  }
});
