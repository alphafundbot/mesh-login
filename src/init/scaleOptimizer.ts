// src/init/scaleOptimizer.ts
import { logTelemetryEvent } from '../monitoring/LoginTelemetry';
export function optimizeMeshScale(config: any) {
  logTelemetryEvent('config:optimizeMeshScale:start', { initialConfig: { ...config } }); // Log a copy to avoid logging changes
  config.batchSize = Math.max(config.batchSize || 10, 100);
  config.retryLimit = Infinity;
  config.parallelism = 'unbounded';
  logTelemetryEvent('config:optimizeMeshScale:end', { optimizedConfig: { ...config } });
  return config;
}
