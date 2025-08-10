// src/compliance/complianceReport.ts
import fs from 'fs';
import { logTelemetryEvent } from '../monitoring/LoginTelemetry'; // Centralized telemetry logging

export function generateComplianceReport(logs: any[]): void {
  const report = { generatedAt: new Date(), entries: logs };
  if (typeof window === 'undefined') {
 logTelemetryEvent('compliance_report:generated', { metadata: { logEntriesCount: logs.length } });
    fs.writeFileSync('compliance-report.json', JSON.stringify(report, null, 2));
  } else {
    console.warn('File system operations are not available in the browser.');
  }
}
