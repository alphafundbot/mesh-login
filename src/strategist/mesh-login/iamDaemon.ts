ts
import fs from 'fs';
import crypto from 'crypto';
// Assuming strategist.config.json is in a reachable path
// import config from './strategist.config.json'; 

// Placeholder for loading config (adapt path as needed)
const config = {
  strategist_id: "nehemie.destine",
  region: "global",
  role: "sovereign-operator",
  signature_algorithm: "RSA",
  public_key_path: "./keys/public.pem", // Adapt path
  private_key_path: "./keys/private.pem" // Adapt path
};

const generateAndWriteSignature = () => {
  try {
    const payload = {
      strategist_id: config.strategist_id,
      region: config.region,
      role: config.role,
      timestamp: new Date().toISOString()
    };

    const privateKey = fs.readFileSync(config.private_key_path, 'utf8');
    const signature = crypto.sign("sha256", Buffer.from(JSON.stringify(payload)), {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    });

    // Adapt path for iam.signature if needed
    fs.writeFileSync('./iam.signature', signature.toString('base64'));
    console.log(`[IAM Daemon] Signature rotated: ${new Date().toISOString()}`);

  } catch (error) {
    console.error('[IAM Daemon] Error rotating signature:', error);
    // Implement error handling and alerting as needed
  }
};

// Initial signature generation on startup
generateAndWriteSignature();

// Rotate signature periodically (every 60 seconds)
setInterval(generateAndWriteSignature, 60000);

// This file serves as a blueprint for an IAM propagation daemon.
// You need to ensure file paths for config and keys are correct,
// and integrate this into your deployment (e.g., Docker Compose).