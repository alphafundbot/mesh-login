// src/compliance/complianceReport.ts
import fs from 'fs';

export function generateComplianceReport(logs: any[]): void {
  const report = { generatedAt: new Date(), entries: logs };
  if (typeof window === 'undefined') {
    fs.writeFileSync('compliance-report.json', JSON.stringify(report, null, 2));
  } else {
    console.warn('File system operations are not available in the browser.');
  }
}
