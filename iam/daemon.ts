import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface StrategistConfig {
  id: string;
  zones: string[];
  mutationProtocol: string;
}

interface Credential {
  strategist: string;
  zone: string;
  issuedAt: string;
  signature: string;
}

class Strategist {
  config: StrategistConfig;
  privateKey: string;

  constructor() {
    this.config = this.loadConfig();
    this.privateKey = this.loadKey();
  }

  private loadConfig(): StrategistConfig {
    const configPath = path.resolve('strategist.config.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  }

  private loadKey(): string {
    const keyPath = path.resolve('keys/strategist.pem');
    return fs.readFileSync(keyPath, 'utf-8');
  }

  generateSignature(payload: string): string {
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(payload);
    signer.end();
    return signer.sign(this.privateKey, 'base64');
  }

  issueCredential(zone: string): Credential {
    const issuedAt = new Date().toISOString();
    const payload = `${this.config.id}:${zone}:${issuedAt}`;
    const signature = this.generateSignature(payload);

    return {
      strategist: this.config.id,
      zone,
      issuedAt,
      signature
    };
  }

  logActivation(): void {
    console.log(`🔐 IAM daemon activated for strategist: ${this.config.id}`);
    console.log(`🌐 Zones: ${this.config.zones.join(', ')}`);
    console.log(`🧬 Mutation protocol: ${this.config.mutationProtocol}`);
  }

  startHeartbeat(): void {
    setInterval(() => {
      const timestamp = new Date().toISOString();
      const payload = `${this.config.id}:${timestamp}`;
      const signature = this.generateSignature(payload);

      console.log(`🫀 Heartbeat @ ${timestamp}`);
      console.log(`🔏 Signature: ${signature.slice(0, 32)}...`);
    }, 60000);
  }

  emitZoneCredentials(): void {
    this.config.zones.forEach(zone => {
      const credential = this.issueCredential(zone);
      console.log(`🪪 Credential issued for zone: ${zone}`);
      console.log(`📜 Signature: ${credential.signature.slice(0, 32)}...`);
    });
  }
}

function startDaemon(): void {
  const strategist = new Strategist();
  strategist.logActivation();
  strategist.emitZoneCredentials();
  strategist.startHeartbeat();
}

startDaemon();