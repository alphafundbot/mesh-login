// For now, a simple in-memory array to store audit entries.
const auditLog: AuditEntry[] = [];

/**
 * Stores an audit entry in the in-memory audit log.
 * @param auditEntry The audit entry to store.
 */
export function storeAuditEntry(auditEntry: AuditEntry): void {
  auditLog.push(auditEntry);
}

// Assume AuditEntry type is defined elsewhere, e e.g.:
// interface AuditEntry {
//   strategist: string;
//   action: string;
//   amount?: number;
//   ritual?: string;
//   timestamp: number;
// }