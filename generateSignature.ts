ts
import fs from 'fs';
import crypto from 'crypto';
import config from './strategist.config.json';

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

fs.writeFileSync('./iam.signature', signature.toString('base64'));
console.log('Strategist signature generated.');