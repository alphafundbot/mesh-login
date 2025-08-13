// src/data/pingResultProcessor.ts

import fs from 'fs';
import path from 'path';

// Assume these interfaces exist based on previous scaffolding
interface CarrierTelemetry {
  carrier?: string;
  device_ip?: string;
  activated?: boolean;
  last_ping?: {
    method?: string;
    latency_ms?: number | { min: number; avg: number; max: number };
    packet_loss_percent?: number;
    timestamp?: string;
  };
  // Add other relevant fields
}

interface OrchestratorLogEntry {
  event: string;
  timestamp: string;
  details?: string;
  // Add other relevant fields like device, protocol, metrics for ping events
  deviceId?: string;
  protocol?: string;
  metrics?: {
    latency_ms?: number | { min: number; avg: number; max: number };
    packet_loss_percent?: number;
    [key: string]: any; // Allow other metrics
  };
  [key: string]: any; // Allow other top-level fields
}

interface PingResult {
  platform: string;
  target: string;
  latencyMs: number | { min: number; avg: number; max: number };
  packetLossPercent: number;
  timestamp: string;
  method?: string; // e.g., "ICMP", "HTTP"
}

const CARRIER_TELEMETRY_FILE = path.resolve(__dirname, '../../carrier_telemetry.json');
const ORCHESTRATOR_LOG_FILE = path.resolve(__dirname, '../../orchestrator_log.json');

export function processPingResult(result: PingResult): void {
  console.log(`Processing ping result from ${result.platform} for ${result.target}...`);

  // 1. Update carrier_telemetry.json
  try {
    let telemetry: CarrierTelemetry = {};
    if (fs.existsSync(CARRIER_TELEMETRY_FILE)) {
      const rawData = fs.readFileSync(CARRIER_TELEMETRY_FILE, 'utf-8');
      telemetry = JSON.parse(rawData);
    }

    // Update the last_ping section
    telemetry.last_ping = {
      method: result.method || 'Unknown', // Use method from result or default
      latency_ms: result.latencyMs,
      packet_loss_percent: result.packetLossPercent,
      timestamp: result.timestamp,
    };
    // Optionally update device_ip if the target is the device's IP
    if (result.target === telemetry.device_ip) {
        telemetry.device_ip = result.target;
    }


    fs.writeFileSync(CARRIER_TELEMETRY_FILE, JSON.stringify(telemetry, null, 2));
    console.log(`✅ Updated ${CARRIER_TELEMETRY_FILE} with ping results.`);

  } catch (err) {
    console.error(`⚠️ Error updating ${CARRIER_TELEMETRY_FILE}:`, err);
  }

  // 2. Log event in orchestrator_log.json
  try {
    let logEntries: OrchestratorLogEntry[] = [];
    if (fs.existsSync(ORCHESTRATOR_LOG_FILE)) {
      const rawData = fs.readFileSync(ORCHESTRATOR_LOG_FILE, 'utf-8');
      // Check if the file is empty before parsing
      if (rawData.trim().length > 0) {
         logEntries = JSON.parse(rawData);
      }
    }

    const logEntry: OrchestratorLogEntry = {
      event: 'global_ping_result',
      timestamp: result.timestamp,
      details: `Ping test completed via ${result.platform} for target ${result.target}.`,
      deviceId: result.target, // Assuming target is the device/endpoint identifier
      protocol: result.method || 'Unknown',
      metrics: {
        latency_ms: result.latencyMs,
        packet_loss_percent: result.packetLossPercent,
      },
      platform: result.platform // Include platform in the log
    };

    logEntries.push(logEntry);


    fs.writeFileSync(ORCHESTRATOR_LOG_FILE, JSON.stringify(logEntries, null, 2));
    console.log(`✅ Logged ping event in ${ORCHESTRATOR_LOG_FILE}.`);

  } catch (err) {
    console.error(`⚠️ Error logging to ${ORCHESTRATOR_LOG_FILE}:`, err);
  }
}