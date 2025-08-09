// src/init/scaleOptimizer.ts
export function optimizeMeshScale(config: any) {
  config.batchSize = Math.max(config.batchSize || 10, 100);
  config.retryLimit = Infinity;
  config.parallelism = 'unbounded';
  return config;
}
