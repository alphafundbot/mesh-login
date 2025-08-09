// src/state/syncStore.ts

const syncTimestamps: Record<string, number> = {};

/**
 * Mock function to get the last sync timestamp for a connector.
 * In a real implementation, this would read from Redis, Firestore, or another persistent store.
 * @param connectorId The ID of the connector.
 * @returns The last sync timestamp (epoch milliseconds), or 0 if none.
 */
export function getLastSync(connectorId: string): number {
    return syncTimestamps[connectorId] || 0;
}

/**
 * Mock function to set the last sync timestamp for a connector.
 * @param connectorId The ID of the connector.
 * @param timestamp The timestamp to set (epoch milliseconds).
 */
export function setLastSync(connectorId: string, timestamp: number): void {
    syncTimestamps[connectorId] = timestamp;
}
