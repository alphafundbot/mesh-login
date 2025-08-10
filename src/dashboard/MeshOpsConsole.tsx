typescriptreact
import React, { useEffect, useState, useMemo } from 'react';
import { subscribeToRitualTelemetry } from '../lib/ritual-engine';
import { fetchCarrierMetadata } from '../infra/carrierTelemetry';

interface RitualEvent {
  id: string;
  name: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp: string;
  parameters: Record<string, any>;
  orchestratorId?: string; // Added for orchestrator grouping
  stepIndex?: number; // Added for step order in orchestration
  stepName?: string; // Added for step name in orchestration
  trigger?: {
    type: 'signal' | 'time' | 'orchestrator';
    value: string;
    telemetry?: Record<string, any>;
  };
  output?: string;
  error?: string;
}

export const MeshOpsConsole: React.FC = () => {
  const [events, setEvents] = useState<RitualEvent[]>([]);
  const [carrierData, setCarrierData] = useState<any>(null);

  useEffect(() => {
    fetchCarrierMetadata().then(setCarrierData);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToRitualTelemetry((event: RitualEvent) => {
      setEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
    });

    return () => unsubscribe();
  }, []);

  // Group events by orchestratorId or event id if no orchestrator
  const groupedEvents = useMemo(() => {
    const groups: Record<string, RitualEvent[]> = {};
    events.forEach(event => {
      const key = event.orchestratorId || event.id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });
    // Sort events within each group by stepIndex
    Object.values(groups).forEach(group => {
      group.sort((a, b) => (a.stepIndex ?? 0) - (b.stepIndex ?? 0));
    });
    return groups;
  }, [events]);

  return (
    <div style={{ padding: '2rem' }}>
      {carrierData && (
        <div className="carrier-ping-status" style={{ marginBottom: '1rem', fontSize: '0.9em', color: '#00ffcc' }}>
          <span>
            📡 {carrierData.carrier} | Signal: {carrierData.signalStrength} | Latency: {carrierData.latencyMs}ms
          </span>
        </div>
      )}
      <h2>📡 Mesh Operations Console</h2>
      {Object.entries(groupedEvents).map(([groupId, groupEvents], i) => (
        <div key={groupId} style={{ marginBottom: '2rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
          <h3>🧬 Orchestrator: {groupEvents[0]?.orchestratorId || 'Manual/Single Ritual'} (ID: {groupId})</h3> {/* Display orchestrator ID */}
          <ul>
            {groupEvents.map((event, j) => (
              <li key={event.id} style={{ marginBottom: '1rem' }}>
                {event.orchestratorId ? (
                  // Display step details for orchestrated rituals
                  <>
                    <strong>Step {event.stepIndex !== undefined ? event.stepIndex : 'N/A'}: {event.stepName || 'Unnamed Step'}</strong> — {event.status.toUpperCase()}
                  </>
                ) : (
                  // Display ritual name for non-orchestrated rituals
                  <strong>{event.name}</strong>
                )}
                 — {event.status.toUpperCase()}
                <br />
                <small>{event.timestamp}</small>
                <br />
                <code>Parameters: {JSON.stringify(event.parameters)}</code>

                {event.trigger?.type === 'signal' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <p>📡 Trigger: Signal — <code>{event.trigger.value}</code></p>
                    {event.trigger.telemetry && (
                      <p>📊 Telemetry Snapshot: <code>{JSON.stringify(event.trigger.telemetry)}</code></p>
                    )}
                  </div>
                )}
                 {event.trigger?.type === 'time' && (
                  <div style={{ marginTop: '0.5rem' }}>
                     <p>⏱️ Trigger: Time — <code>{event.trigger.value}</code></p>
                  </div>
                )}
                 {event.trigger?.type === 'orchestrator' && (
                  <div style={{ marginTop: '0.5rem' }}>
                     <p>🧬 Trigger: Orchestrator — <code>{event.trigger.value}</code></p>
                  </div>
                )}

                {event.output && <p>✅ Output: {event.output}</p>}
                {event.error && <p style={{ color: 'red' }}>⚠️ Error: {event.error}</p>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};