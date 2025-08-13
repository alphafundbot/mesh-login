// src/lib/telecom-types.ts

export type TelecomSignal = {
  timestamp: string;
  source: string;
  signalType: string;
  strength: number;
  region: string;
};

export type SignalStrengthMap = {
  [key: string]: number; // Key could be 'region_signalType'
};

export type SignalEvent = {
  timestamp: string;
  region: string;
  signalType: string; // This property already exists, keep it.
  eventType?: 'strengthChange' | 'typeChange' | 'newSignal'; // Example event types, make optional as not always present
  details?: any; // Details about the event, e.g., previous strength, new strength, make optional.
  anomaly?: boolean; // Add anomaly property
  source?: string; // Add source property
  strength?: number; // Add strength property
  tier?: string; // Add tier property
};