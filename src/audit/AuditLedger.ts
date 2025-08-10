import { logTelemetryEvent } from '../monitoring/LoginTelemetry'; // Centralized telemetry logging

// For now, a simple in-memory array to store audit entries.
const auditLog: AuditEntry[] = [];

/**
 * Stores an audit entry in the in-memory audit log.
 * @param auditEntry The audit entry to store.
 */
export function storeAuditEntry(auditEntry: AuditEntry): void {
  auditLog.push(auditEntry);
  logTelemetryEvent('audit_ledger:entry_stored', {
    metadata: {
      strategist: auditEntry.strategist,
      action: auditEntry.action,
    },
  });
}

// Assume AuditEntry type is defined elsewhere, e e.g.:
// interface AuditEntry {
//   strategist: string;
//   action: string;
//   amount?: number;
//   ritual?: string;
//   timestamp: number;
// }