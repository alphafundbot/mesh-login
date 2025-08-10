// src/infra/signal-router.ts

type SignalModalityType = "wifi" | "fiber" | "antenna" | "electrical" | "mobile" | "underwater_cable" | "electric_grid" | "unlicensed_frequency" | "gravity" | "antenna_backhaul";

interface BaseSignalModality {
  enabled: boolean;
  fallback: boolean;
  latencyThresholdMs: number;
}

interface WifiModality extends BaseSignalModality {
  type: "wifi";
  ssid: string;
  signalStrengthThreshold?: number;
}

interface FiberModality extends BaseSignalModality {
  type: "fiber";
  connectorType: string;
  bandwidthGbps: number;
}

interface AntennaModality extends BaseSignalModality {
  type: "antenna";
  frequencyBand: string;
  gainDbi: number;
}

interface ElectricalModality extends BaseSignalModality {
  type: "electrical";
  protocol: string; // e.g., Powerline
  voltage: number;
}

interface MobileModality extends BaseSignalModality {
  type: "mobile";
  carrier: string;
  ipRange: string;
}

interface UnderwaterCableModality extends BaseSignalModality {
 type: "underwater_cable";
 cableName: string;
 capacityGbps: number;
}

interface ElectricGridModality extends BaseSignalModality {
 type: "electric_grid";
 gridType: string; // e.g., AC, DC
 voltage: number;
}

interface UnlicensedFrequencyModality extends BaseSignalModality {
 type: "unlicensed_frequency";
 frequencyBand: string; // e.g., 2.4 GHz, 5.8 GHz
 maxPowerDbm: number;
}

interface GravityModality extends BaseSignalModality {
 type: "gravity";
 powerSource: string; // e.g., GravityLight, NowLight
 generationRateWatts: number;
}

interface AntennaBackhaulModality extends BaseSignalModality {
 type: "antenna_backhaul";
 frequencyBand: string; // e.g., 5.8 GHz U-NII
 linkDistanceKm: number;
}


type SignalModalityConfig = WifiModality | FiberModality | AntennaModality | ElectricalModality | MobileModality | UnderwaterCableModality | ElectricGridModality | UnlicensedFrequencyModality | GravityModality | AntennaBackhaulModality;


export const signalModalities: Record<SignalModalityType, Omit<SignalModalityConfig, 'type'>> = {
  wifi: {
    enabled: true,
    fallback: true,
    latencyThresholdMs: 100,
    ssid: "MeshNet-WiFi",
    signalStrengthThreshold: -70,
  },
  fiber: {
    enabled: true,
    fallback: false,
    latencyThresholdMs: 10,
    connectorType: "LC",
    bandwidthGbps: 40,
  },
  antenna: {
    enabled: true,
    fallback: true,
    latencyThresholdMs: 200,
    frequencyBand: "5G",
    gainDbi: 15,
  },
  electrical: {
    enabled: false, // Usually for internal node communication or specific scenarios
    fallback: true,
    latencyThresholdMs: 50,
    protocol: "Powerline",
    voltage: 120,
  },
  mobile: {
    enabled: true,
    carrier: 'Netgear-Hotspot',
    ipRange: '192.168.1.0/24',
    fallback: true,
    latencyThresholdMs: 250,
  },
  underwater_cable: {
 enabled: true,
    fallback: false,
 latencyThresholdMs: 5,
 cableName: "MAREA",
 capacityGbps: 16000,
  },
  electric_grid: {
 enabled: true,
    fallback: true, // Can act as a fallback power/signaling source
 latencyThresholdMs: 60, // Powerline communication latency
 gridType: "AC",
 voltage: 120,
  },
  unlicensed_frequency: {
 enabled: true,
    fallback: true,
 latencyThresholdMs: 150,
 frequencyBand: "2.4 GHz",
 maxPowerDbm: 30, // Example for ISM band
  },
  gravity: {
 enabled: true, // Can be enabled even if primary power is off
    fallback: true,
 latencyThresholdMs: 500, // High latency for low-power signal
 powerSource: "GravityLight",
 generationRateWatts: 0.1, // Example low power generation
  },
  antenna_backhaul: {
 enabled: true,
    fallback: false, // Typically a primary backhaul link
 latencyThresholdMs: 80, // Point-to-point link latency
 frequencyBand: "5.8 GHz U-NII",
 linkDistanceKm: 10, // Example link distance
  },
};


export function routeSignal(modality: SignalModalityType): SignalModalityConfig {
  const config = signalModalities[modality];
  // In a real scenario, this would involve more complex routing logic
  // based on real-time signal quality, mesh topology, etc.
  // This is a simplified representation.

  // We need to add the 'type' property back for the return type compliance
  switch (modality) {
    case "wifi":
      return { type: "wifi", ...config as Omit<WifiModality, 'type'> };
    case "fiber":
      return { type: "fiber", ...config as Omit<FiberModality, 'type'> };
    case "antenna":
      return { type: "antenna", ...config as Omit<AntennaModality, 'type'> };
    case "electrical":
      return { type: "electrical", ...config as Omit<ElectricalModality, 'type'> };
    case "mobile":
      return { type: "mobile", ...config as Omit<MobileModality, 'type'> };
    case "underwater_cable":
      return { type: "underwater_cable", ...config as Omit<UnderwaterCableModality, 'type'> };
    case "electric_grid":
      return { type: "electric_grid", ...config as Omit<ElectricGridModality, 'type'> };
    case "unlicensed_frequency":
      return { type: "unlicensed_frequency", ...config as Omit<UnlicensedFrequencyModality, 'type'> };
    case "gravity":
      return { type: "gravity", ...config as Omit<GravityModality, 'type'> };
    case "antenna_backhaul":
      return { type: "antenna_backhaul", ...config as Omit<AntennaBackhaulModality, 'type'> };
    default:
      throw new Error(`Unknown signal modality: ${modality}`);
  }
}