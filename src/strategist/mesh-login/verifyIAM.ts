ts
import fs from 'fs';
import crypto from 'crypto';
import config from './strategist.config.json';

const publicKey = fs.readFileSync(config.public_key_path, 'utf8');
const signature = fs.readFileSync('./iam.signature', 'utf8');
const payload = {
  strategist_id: config.strategist_id,
  region: config.region,
  role: config.role,
  timestamp: new Date().toISOString()
};

const isValid = crypto.verify(
  "sha256",
  Buffer.from(JSON.stringify(payload)),
  {
    key: publicKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  },
  Buffer.from(signature, 'base64')
);

console.log(isValid ? '✅ IAM verified.' : '❌ IAM verification failed.');