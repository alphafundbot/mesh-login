import { processPingResult } from './src/ingestion/pingResultProcessor';

const pingResult = {
  platform: 'Nix Shell Curl Test',
  target: 'https://google.com',
  method: 'HTTPS/Curl',
  latencyMs: 127,
  packetLossPercent: 0,
  timestamp: new Date().toISOString()
};

processPingResult(pingResult);