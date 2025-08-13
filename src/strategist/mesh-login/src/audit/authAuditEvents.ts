ts
// src/audit/authAuditEvents.ts
import { AuditEngine } from './AuditEngine'; // Assuming AuditEngine is in the same directory
import { FirebaseConfig } from '../lib/types'; // Assuming FirebaseConfig type is defined in types.ts

const auditEngine = new AuditEngine(); // Initialize AuditEngine

export const logLoginSuccess = (userId: string, timestamp: number = Date.now()) => {
  auditEngine.logEvent('auth:login_success', {
    userId,
    timestamp,
    message: `User ${userId} logged in successfully.`
  });
};

export const logLoginFailed = (reason: string, details?: any, timestamp: number = Date.now()) => {
  auditEngine.logEvent('auth:login_failed', {
    reason,
    details,
    timestamp,
    message: `Login failed: ${reason}`
  });
};

export const logAuthConfigMissing = (missingFields: (keyof FirebaseConfig)[], timestamp: number = Date.now()) => {
  auditEngine.logEvent('auth:config_missing', {
    missingFields,
    timestamp,
    message: `Firebase config missing required fields: ${missingFields.join(', ')}`
  });
};