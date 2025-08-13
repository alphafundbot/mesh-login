import { getCarrierMetadata } from './signal-router';
import fs from 'fs';
import path from 'path';

export function syncCarrierTelemetry() {
  const metadata = getCarrierMetadata();
  const telemetryPath = path.resolve(__dirname, 'carrier_telemetry.json'); // Or adjust to your telemetry directory

  try {
    fs.writeFileSync(telemetryPath, JSON.stringify(metadata, null, 2));
    console.log('Carrier telemetry synced.');
  } catch (err) {
    console.error('Error syncing carrier telemetry:', err);
  }
}