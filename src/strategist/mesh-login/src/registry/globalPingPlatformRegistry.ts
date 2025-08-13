// src/registry/globalPingPlatformRegistry.ts

interface PingPlatformInfo {
  name: string;
  url: string;
  capabilities: string[];
  apiEndpoint?: string;
  notes?: string;
}

const pingPlatforms: PingPlatformInfo[] = [
  {
    name: "Globalping",
    url: "https://globalping.io/",
    capabilities: ["ping", "traceroute", "dig", "curl", "mtr"],
    apiEndpoint: "https://api.globalping.io/v1/",
    notes: "CLI and API automation available."
  },
  {
    name: "Meter.net World Ping Test",
    url: "https://www.meter.net/tools/world-ping-test/",
    capabilities: ["ping"],
    notes: "Free access, 50+ global cities, visual results."
  },
  {
    name: "HostingChecker Ping Tool",
    url: "https://hostingchecker.com/v1/tools/ping/",
    capabilities: ["ping"],
    apiEndpoint: "https://hostingchecker.com/api/v1/tools/ping", // Example API endpoint (may vary)
    notes: "10+ global locations, color-coded results."
  }
];

export function addPingPlatform(platform: PingPlatformInfo): void {
  pingPlatforms.push(platform);
  // In a real application, you would also persist this data
}

export function getPingPlatform(name: string): PingPlatformInfo | undefined {
  return pingPlatforms.find(platform => platform.name === name);
}

export function filterPingPlatforms(criteria: Partial<PingPlatformInfo>): PingPlatformInfo[] {
  return pingPlatforms.filter(platform => {
    for (const key in criteria) {
      if (criteria.hasOwnProperty(key)) {
        // Simple equality check for demonstration
        if (Array.isArray((platform as any)[key])) {
           if (!(criteria as any)[key].every((item: any) => (platform as any)[key].includes(item))) {
             return false;
           }
        } else if ((platform as any)[key] !== (criteria as any)[key]) {
          return false;
        }
      }
    }
    return true;
  });
}

export function getAllPingPlatforms(): PingPlatformInfo[] {
  return pingPlatforms;
}

export { pingPlatforms };