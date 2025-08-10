tsx
// src/components/ui/AuditTrailPanel.tsx
import React, { useEffect, useState } from 'react';
import { designTokens } from '../../design/DesignTokenReceiver'; // Adjust the import path as needed
import { AuditEngine } from '../../audit/AuditEngine';
import { meshBus, MeshEvent } from '../../core/MeshBus';

const auditEngine = new AuditEngine();

interface AuditEvent {
  id: string;
  timestamp: string;
  event: string;
  type: string;
  details?: any; // Added details field
}

const AuditTrailPanel: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]); // Explicitly type the state

  useEffect(() => {
    const fetchEvents = async () => {
      const recent = await auditEngine.getRecentEvents();
      setEvents(recent);
    };
    fetchEvents();

    const handleMeshEvent = (event: MeshEvent) => {
      if (event.type === 'audit:event') {
        // Assuming event.payload matches the AuditEvent structure
        setEvents(prev => [event.payload as AuditEvent, ...prev]); 
      }
    };

    meshBus.subscribe(handleMeshEvent);
    return () => meshBus.unsubscribe(handleMeshEvent);
  }, []); // Empty dependency array to run only on mount and unmount

  return (
    <div style={{
      backgroundColor: designTokens.colors.background,
      padding: designTokens.spacing.lg,
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <h2 style={{
        color: designTokens.colors.primary,
        fontSize: designTokens.typography.heading,
        marginBottom: designTokens.spacing.md
      }}>Audit Trail</h2>
      {events.length === 0 ? (
        <p style={{ color: designTokens.colors.primary, fontSize: designTokens.typography.body }}>No audit events found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {events.map(event => (
            <li key={event.id} style={{
              marginBottom: designTokens.spacing.sm,
              padding: designTokens.spacing.sm,
              backgroundColor: '#fff',
              borderRadius: '4px',
              transition: 'background-color 0.3s ease'
            }}>
              <div>
                <strong>{event.event}</strong>
                <span style={{ fontSize: designTokens.typography.caption, color: designTokens.colors.accent, marginLeft: designTokens.spacing.sm }}>
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
              {event.details && (
                <pre style={{
                  fontSize: designTokens.typography.caption,
                  color: designTokens.colors.primary,
                  backgroundColor: designTokens.colors.background,
                  padding: designTokens.spacing.sm,
                  borderRadius: '4px',
                  marginTop: designTokens.spacing.sm,
                  overflowX: 'auto'
                }}>
                  {JSON.stringify(event.details, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AuditTrailPanel;