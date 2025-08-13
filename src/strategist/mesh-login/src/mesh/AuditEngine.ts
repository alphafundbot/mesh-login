import { meshBus } from './MeshBus'; // Assuming MeshBus.ts exists

// Mock function to simulate a data stream of global audit events
export const streamGlobalEvents = () => {
  // Mock interval to simulate events every 1 second
  setInterval(() => {
    const mockEvent = {
      type: 'globe:audit_spike',
      payload: {
        // Mock latitude and longitude within a plausible range
        lat: (Math.random() * 180) - 90,
        lon: (Math.random() * 360) - 180,
        // Mock severity level
        severity: ['info', 'warning', 'critical'][Math.floor(Math.random() * 3)],
        // Mock timestamp
        timestamp: Date.now()
      }
    };

    // Publish the mock event to the meshBus
    meshBus.publish(mockEvent);

  }, 1000); // Publish an event every 1000 milliseconds (1 second)

  console.log("AuditEngine: Mock global event stream started.");
};