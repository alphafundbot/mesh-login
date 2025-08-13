import { TelecomSignal } from './telecom-types'; // Assuming TelecomSignal is defined here

export interface TelemetryEvent {
  timestamp: number;
  signal: TelecomSignal; // Or appropriate type for signal data
  status?: string; // Optional status property
  // Add other relevant telemetry properties here
  nodeId?: string;
  cpuLoad?: number;
  signalModality?: string;
  latencyMs?: number;
  bandwidthMbps?: number;
  reliability?: number;
  stealthScore?: number;
}