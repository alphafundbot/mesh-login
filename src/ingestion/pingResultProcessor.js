"use strict";
// src/data/pingResultProcessor.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPingResult = processPingResult;
var fs_1 = require("fs");
var path_1 = require("path");
var CARRIER_TELEMETRY_FILE = path_1.default.resolve(__dirname, '../../carrier_telemetry.json');
var ORCHESTRATOR_LOG_FILE = path_1.default.resolve(__dirname, '../../orchestrator_log.json');
function processPingResult(result) {
    console.log("Processing ping result from ".concat(result.platform, " for ").concat(result.target, "..."));
    // 1. Update carrier_telemetry.json
    try {
        var telemetry = {};
        if (fs_1.default.existsSync(CARRIER_TELEMETRY_FILE)) {
            var rawData = fs_1.default.readFileSync(CARRIER_TELEMETRY_FILE, 'utf-8');
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
        fs_1.default.writeFileSync(CARRIER_TELEMETRY_FILE, JSON.stringify(telemetry, null, 2));
        console.log("\u2705 Updated ".concat(CARRIER_TELEMETRY_FILE, " with ping results."));
    }
    catch (err) {
        console.error("\u26A0\uFE0F Error updating ".concat(CARRIER_TELEMETRY_FILE, ":"), err);
    }
    // 2. Log event in orchestrator_log.json
    try {
        var logEntries = [];
        if (fs_1.default.existsSync(ORCHESTRATOR_LOG_FILE)) {
            var rawData = fs_1.default.readFileSync(ORCHESTRATOR_LOG_FILE, 'utf-8');
            // Check if the file is empty before parsing
            if (rawData.trim().length > 0) {
                logEntries = JSON.parse(rawData);
            }
        }
        var logEntry = {
            event: 'global_ping_result',
            timestamp: result.timestamp,
            details: "Ping test completed via ".concat(result.platform, " for target ").concat(result.target, "."),
            deviceId: result.target, // Assuming target is the device/endpoint identifier
            protocol: result.method || 'Unknown',
            metrics: {
                latency_ms: result.latencyMs,
                packet_loss_percent: result.packetLossPercent,
            },
            platform: result.platform // Include platform in the log
        };
        logEntries.push(logEntry);
        fs_1.default.writeFileSync(ORCHESTRATOR_LOG_FILE, JSON.stringify(logEntries, null, 2));
        console.log("\u2705 Logged ping event in ".concat(ORCHESTRATOR_LOG_FILE, "."));
    }
    catch (err) {
        console.error("\u26A0\uFE0F Error logging to ".concat(ORCHESTRATOR_LOG_FILE, ":"), err);
    }
}
