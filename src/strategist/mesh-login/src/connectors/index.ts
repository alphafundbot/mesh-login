// src/connectors/index.ts
import type { Connector } from './Connector';
import { CloudflareConnectorV2 } from './CloudflareConnectorV2';


const connectors: Record<string, Connector> = {};

export function registerConnector(conn: Connector) {
  if (connectors[conn.id]) {
      console.warn(`Connector with ID "${conn.id}" is already registered. Overwriting.`);
  }
  connectors[conn.id] = conn;
}

export function getConnector(id: string): Connector | undefined {
  return connectors[id];
}

export function getAllConnectors(): Connector[] {
    return Object.values(connectors);
}

// Auto-register known connectors
registerConnector(CloudflareConnectorV2);
