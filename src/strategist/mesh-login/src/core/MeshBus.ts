ts
// src/core/MeshBus.ts

import { logTelemetryEvent } from '../monitoring/LoginTelemetry'; // Centralized telemetry logging
type MeshEvent = {
  type: string;
  payload: any;
};

type MeshListener = (event: MeshEvent) => void;

class MeshBus {
  private listeners: MeshListener[] = [];

  subscribe(listener: MeshListener): void {
    // Log telemetry event for subscription
    logTelemetryEvent('mesh_bus:subscribed', {
      metadata: {
        listener: listener.name || 'anonymous', // Log listener name if available
        listenerCount: this.listeners.length + 1,
      },
    });
    this.listeners.push(listener);
  }

  unsubscribe(listener: MeshListener): void {
    this.listeners = this.listeners.filter(l => l !== listener);
    // Log telemetry event for unsubscription
    logTelemetryEvent('mesh_bus:unsubscribed', {
      metadata: {
        listener: listener.name || 'anonymous', // Log listener name if available
        listenerCount: this.listeners.length,
      },
    });
  }

  publish(event: MeshEvent): void {
    logTelemetryEvent('mesh_bus:published', { metadata: { eventType: event.type, payload: event.payload } });
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

export const meshBus = new MeshBus();