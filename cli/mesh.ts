// cli/mesh.ts
#!/usr/bin/env node
import yargs from 'yargs';

yargs.command('status', 'Show mesh status', {}, async () => {
  const { collectMetrics } = require('../src/monitoring/performanceMetricsEngine');
  console.log('Mesh Metrics:', collectMetrics());
}).argv;
