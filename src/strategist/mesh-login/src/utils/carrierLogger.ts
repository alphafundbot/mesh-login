import fs from 'fs';
import path from 'path';

const logPath = path.resolve(__dirname, '../../logs/carrier_log.json');

export function logCarrierMetadata(carrierName: string, ip: string, latency: number): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    carrier: carrierName,
    ip: ip,
    latency: latency,
  };

  const logString = JSON.stringify(logEntry) + '\n';

  try {
    // Ensure the logs directory exists
    const logDir = path.dirname(logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    fs.appendFileSync(logPath, logString, 'utf-8');
  } catch (err) {
    console.error('Error logging carrier metadata:', err);
  }
}