ts
import fs from 'fs';
const signature = fs.readFileSync('./iam.signature', 'utf8');

const envInjection = `STRATEGIST_SIGNATURE=${signature}`;
fs.appendFileSync('.env.local', `
${envInjection}
`);
console.log('Strategist IAM injected into .env.local');