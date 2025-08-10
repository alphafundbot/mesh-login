"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pingResultProcessor_1 = require("./src/ingestion/pingResultProcessor");
var pingResult = {
    platform: 'Nix Shell Curl Test',
    target: 'https://google.com',
    method: 'HTTPS/Curl',
    latencyMs: 127,
    packetLossPercent: 0,
    timestamp: new Date().toISOString()
};
(0, pingResultProcessor_1.processPingResult)(pingResult);
