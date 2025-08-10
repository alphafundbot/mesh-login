// SignalRouter.ts
import { meshBus } from './MeshBus'; // Assuming MeshBus.ts exists

// Mock function to simulate a signal route data stream
export const streamGlobalRoutes = () => {
  console.log('SignalRouter: Starting mock streamGlobalRoutes...');
  setInterval(() => {
    const mockRoute = {
      startLat: Math.random() * 180 - 90,
      startLon: Math.random() * 360 - 180,
      endLat: Math.random() * 180 - 90,
      endLon: Math.random() * 360 - 180,
      latency: Math.random() * 100 + 10, // ms
      bandwidth: Math.random() * 1000 + 100, // Mbps
    };

    meshBus.publish({
      type: 'globe:signal_route',
      payload: mockRoute,
    });

    // console.log('SignalRouter: Published mock signal route', mockRoute);

  }, 2000); // Publish mock data every 2 seconds
};

// This is mock data and should be replaced with actual data streaming logic.