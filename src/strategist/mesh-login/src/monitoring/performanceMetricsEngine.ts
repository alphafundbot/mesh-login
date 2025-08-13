// src/monitoring/performanceMetricsEngine.ts
export function collectMetrics(): Record<string, number> {
  return {
    memoryUsage: typeof process !== 'undefined' ? process.memoryUsage().heapUsed : 0,
    activeOverrides: Object.keys(require('../rollback/overrideRollbackEngine')).length
  };
}
