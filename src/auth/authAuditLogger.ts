ts
// src/auth/authAuditLogger.ts

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
      console.log(`Auth Event: ${eventName}`, data);
    }
  }

  logLoginSuccess(userId: string): void {
    this.log('auth:login_success', { userId, timestamp: Date.now() });
  }

  logLoginFailed(reason: string, details?: any): void {
    this.log('auth:login_failed', { reason, details, timestamp: Date.now() });
  }

  logConfigMissing(missingField: string): void {
    this.log('auth:config_missing', { missingField, timestamp: Date.now() });
  }
}

export default AuthAuditLogger;