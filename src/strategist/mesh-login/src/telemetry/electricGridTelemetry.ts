// src/telemetry/electricGridTelemetry.ts

import fs from 'fs';
import path from 'path';

interface ElectricGridTelemetryData {
  timestamp: string;
  voltageStability: number; // e.g., percentage deviation from nominal
  frequencyHz: number;      // e.g., power grid frequency in Hz
  powerFlowMW: number;      // e.g., power flow in Megawatts
  gridIdentifier: string;   // e.g., name or ID of the grid section
}

const logFilePath = path.resolve(__dirname, '../../logs/electric_grid_telemetry.json');

/**
 * Simulates fetching telemetry data from an electric grid.
 * In a real scenario, this would interact with grid APIs or sensors.
 */
export function simulateFetchElectricGridTelemetry(gridId: string): ElectricGridTelemetryData {
  // Simulate data based on time or random values
  const now = new Date();
  const timestamp = now.toISOString();
  const voltageStability = 99.5 + Math.random(); // Simulate small fluctuations
  const frequencyHz = 60.0 + (Math.random() - 0.5) * 0.1; // Simulate small deviation from 60Hz
  const powerFlowMW = 100 + Math.random() * 50; // Simulate power flow

  return {
    timestamp,
    voltageStability,
    frequencyHz,
    powerFlowMW,
    gridIdentifier: gridId,
  };
}

/**
 * Logs electric grid telemetry data to a JSON file.
 */
export function logElectricGridTelemetry(data: ElectricGridTelemetryData): void {
  let existingLogs: ElectricGridTelemetryData[] = [];

  try {
    if (fs.existsSync(logFilePath)) {
      const raw = fs.readFileSync(logFilePath, 'utf-8');
      existingLogs = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading electric grid telemetry log:', err);
  }

  existingLogs.push(data);

  try {
    fs.writeFileSync(logFilePath, JSON.stringify(existingLogs, null, 2));
  } catch (err) {
    console.error('Error writing electric grid telemetry log:', err);
  }
}