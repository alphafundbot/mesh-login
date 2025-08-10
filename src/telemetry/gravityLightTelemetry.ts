import fs from 'fs';
import path from 'path';

const logFilePath = path.join(__dirname, '../../logs/gravity_light_telemetry.json');

interface GravityLightMetrics {
  energyGeneratedJoules: number;
  uptimeMinutes: number;
  lightIntensityLumens: number;
  timestamp: string;
}

export function simulateFetchGravityLightTelemetry(): GravityLightMetrics {
  // Simulate fetching data from a gravity light sensor
  const energyGenerated = Math.random() * 100; // Simulate energy generated in Joules
  const uptime = Math.random() * 60; // Simulate uptime in minutes
  const intensity = Math.random() * 500; // Simulate light intensity in Lumens

  return {
    energyGeneratedJoules: energyGenerated,
    uptimeMinutes: uptime,
    lightIntensityLumens: intensity,
    timestamp: new Date().toISOString(),
  };
}

export function logGravityLightTelemetry(metrics: GravityLightMetrics): void {
  let existingLogs: GravityLightMetrics[] = [];

  try {
    if (fs.existsSync(logFilePath)) {
      const rawData = fs.readFileSync(logFilePath, 'utf-8');
      existingLogs = JSON.parse(rawData);
    }
  } catch (error) {
    console.error('Error reading gravity light telemetry log:', error);
  }

  existingLogs.push(metrics);

  try {
    fs.writeFileSync(logFilePath, JSON.stringify(existingLogs, null, 2));
  } catch (error) {
    console.error('Error writing gravity light telemetry log:', error);
  }
}