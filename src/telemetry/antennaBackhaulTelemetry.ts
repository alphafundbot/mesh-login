import fs from 'fs';
import path from 'path';

const logFilePath = path.join(__dirname, '../../logs/antenna_backhaul_telemetry.json');

interface AntennaBackhaulTelemetry {
  timestamp: string;
  signalStrength_dBm: number;
  throughput_Mbps: number;
  linkStability_percent: number;
  latency_ms: number;
  modality: string;
  details?: string;
}

export function simulateFetchAntennaBackhaulTelemetry(modality: string): AntennaBackhaulTelemetry {
  const now = new Date().toISOString();
  const signalStrength = -40 - Math.random() * 30; // Simulate -40 to -70 dBm
  const throughput = 50 + Math.random() * 150; // Simulate 50 to 200 Mbps
  const linkStability = 80 + Math.random() * 20; // Simulate 80 to 100%
  const latency = 10 + Math.random() * 40; // Simulate 10 to 50 ms

  return {
    timestamp: now,
    signalStrength_dBm: parseFloat(signalStrength.toFixed(2)),
    throughput_Mbps: parseFloat(throughput.toFixed(2)),
    linkStability_percent: parseFloat(linkStability.toFixed(2)),
    latency_ms: parseFloat(latency.toFixed(2)),
    modality: modality,
    details: `Telemetry for ${modality} antenna backhaul`
  };
}

export function logAntennaBackhaulTelemetry(telemetry: AntennaBackhaulTelemetry): void {
  let existingLogs: AntennaBackhaulTelemetry[] = [];

  try {
    if (fs.existsSync(logFilePath)) {
      const rawData = fs.readFileSync(logFilePath, 'utf-8');
      existingLogs = JSON.parse(rawData);
    }
  } catch (error) {
    console.error('Error reading antenna backhaul telemetry log:', error);
  }

  existingLogs.push(telemetry);

  try {
    fs.writeFileSync(logFilePath, JSON.stringify(existingLogs, null, 2));
    console.log(`Logged antenna backhaul telemetry for ${telemetry.modality}`);
  } catch (error) {
    console.error('Error writing antenna backhaul telemetry log:', error);
  }
}

// Example usage (can be integrated into a polling mechanism)
// const simulatedData = simulateFetchAntennaBackhaulTelemetry('unlicensed_frequency');
// logAntennaBackhaulTelemetry(simulatedData);