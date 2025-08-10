// src/telemetry/underwaterCableTelemetry.ts

import fs from 'fs';
import path from 'path';

interface UnderwaterCableMetrics {
  latencyMs: number;
  bandwidthMbps: number;
  signalIntegrity: number; // 0-1 scale
  timestamp: string;
}

const telemetryLogPath = path.resolve(__dirname, '../../logs/underwater_cable_telemetry.json');

/**
 * Simulates fetching telemetry data for underwater cables.
 * Replace with actual API calls or sensor readings in a real implementation.
 */
export function simulateFetchUnderwaterCableTelemetry(): UnderwaterCableMetrics {
  const now = new Date().toISOString();
  // Simulate realistic-ish values for a cable
  const simulatedLatency = Math.random() * (50 - 10) + 10; // 10-50ms
  const simulatedBandwidth = Math.random() * (100000 - 50000) + 50000; // 50-100 Gbps (Mbps in name is a simplification for demo)
  const simulatedSignalIntegrity = Math.random() * (1 - 0.95) + 0.95; // 0.95-1.0

  return {
    latencyMs: parseFloat(simulatedLatency.toFixed(2)),
    bandwidthMbps: parseFloat(simulatedBandwidth.toFixed(2)),
    signalIntegrity: parseFloat(simulatedSignalIntegrity.toFixed(2)),
    timestamp: now,
  };
}

/**
 * Logs underwater cable telemetry data to a JSON file.
 */
export function logUnderwaterCableTelemetry(metrics: UnderwaterCableMetrics): void {
  let existingLogs: UnderwaterCableMetrics[] = [];

  try {
    if (fs.existsSync(telemetryLogPath)) {
      const raw = fs.readFileSync(telemetryLogPath, 'utf-8');
      if (raw) {
        existingLogs = JSON.parse(raw);
      }
    }
  } catch (err) {
    console.error('Error reading underwater cable telemetry log:', err);
  }

  existingLogs.push(metrics);

  try {
    fs.writeFileSync(telemetryLogPath, JSON.stringify(existingLogs, null, 2));
  } catch (err) {
    console.error('Error writing underwater cable telemetry log:', err);
  }
}

// Example usage (for demonstration, not part of the exported functions)
// const latestTelemetry = simulateFetchUnderwaterCableTelemetry();
// logUnderwaterCableTelemetry(latestTelemetry);