import React from 'react';

// Assume AuditOverlay.tsx, MeshManifest.json, and StrategistCalendar.ts
// provide data or APIs for accessing login audit information.
import { AuditEvent } from '../lib/types'; // Import centralized AuditEvent type

interface LoginAuditProps {
  loginAttempts?: AuditEvent[]; // Use centralized AuditEvent type
  // Add props for anomalies, redirect drift, etc.
}

const LoginAudit: React.FC<LoginAuditProps> = ({ loginAttempts }) => {
  return (
    <div className="login-audit-panel">
      <h3 className="text-lg font-semibold mb-4">Strategist Login Audit</h3>
      {loginAttempts && loginAttempts.length > 0 ? (
        <ul>
          {loginAttempts.map((attempt, index) => (
            <li key={index} className={`border-b py-2 ${attempt.status === 'failure' ? 'text-red-500' : 'text-green-500'}`}>
              <strong>Timestamp:</strong> {attempt.timestamp} |{' '}
              <strong>Strategist ID:</strong> {attempt.uid || 'N/A'} |{' '} {/* Use uid from AuditEvent */}
              {/* Infer status from eventType or presence of error */}
              <strong>Status:</strong> {attempt.eventType.includes('FAILURE') ? 'failure' : 'success'}
              {attempt.error && <p className="text-sm">Error: {attempt.error}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No login attempts to display.</p>
      )}

      {/* Placeholder for visualizing anomalies, redirect drift, etc. */}
      <div className="mt-4">
        {/* Add visualization elements here */}
        {/* <AuditOverlay data={anomalies} /> */}
        {/* <p>Audit overlays for anomalies and drift will appear here.</p> */}
      </div>
    </div>
  );
};

export default LoginAudit;