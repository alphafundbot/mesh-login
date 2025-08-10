ts
// src/auth/authAuditLogger.ts

import { logTelemetryEvent } from '../monitoring/LoginTelemetry';
interface AuditEngine {
  logEvent(eventName: string, data?: any): void;
}

class AuthAuditLogger {
  private auditEngine: AuditEngine | null;

  constructor(auditEngine?: AuditEngine) {
    this.auditEngine = auditEngine || null;
  }

  private log(eventName: string, data?: any): void {
    if (this.auditEngine) {
      this.auditEngine.logEvent(eventName, data);
    } else {
 console.log(`Auth Event (AuditEngine not available): ${eventName}`, data);
    }
    // Also log to telemetry for broader monitoring
 logTelemetryEvent(`auth:${eventName.replace('auth:', '')}`, { metadata: data });
  }

  logLoginSuccess(userId: string): void {
    const data = { userId, timestamp: Date.now() };
 this.log('auth:login_success', data);
  }

  logLoginFailed(reason: string, details?: any): void {
    const data = { reason, details, timestamp: Date.now() };
 this.log('auth:login_failed', data);
  }

  logConfigMissing(missingField: string): void {
    const data = { missingField, timestamp: Date.now() };
 this.log('auth:config_missing', data);
  }
}

export default AuthAuditLogger;