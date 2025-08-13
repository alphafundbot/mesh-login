// src/lib/telecom-processor.ts

import { TelecomSignal, SignalStrengthMap, SignalEvent } from "./telecom-types";

/**
 * Processes raw telecom signals to generate telemetry overlays.
 * @param signals - An array of raw TelecomSignal objects.
 * @returns A structure containing processed telemetry data.
 */
export function processTelecomSignals(
  signals: TelecomSignal[]
): { signalStrengthMap: SignalStrengthMap; signalEvents: SignalEvent[] } {
  const signalStrengthMap: SignalStrengthMap = {};
  const signalEvents: SignalEvent[] = [];
  const signalGroups: { [key: string]: { totalStrength: number; count: number } } = {};

  signals.forEach((signal) => {
    const groupKey = `${signal.region}_${signal.signalType}`;
    if (!signalGroups[groupKey]) {
      signalGroups[groupKey] = { totalStrength: 0, count: 0 };
    }
    signalGroups[groupKey].totalStrength += signal.strength;
    signalGroups[groupKey].count++;

    let tier: "Low" | "Medium" | "High" | "Critical";
    if (signal.strength < 40) tier = "Low";
    else if (signal.strength < 70) tier = "Medium";
    else if (signal.strength < 90) tier = "High";
    else tier = "Critical";

    const anomaly = signal.strength > 100 || signal.source === "unknown" || signal.region === "Unmapped";

    // This part seems to be generating SignalEvent objects directly from TelecomSignal
    // instead of generating separate events based on processing.
    // Let's adjust this to match the requested output structure which seems to imply
    // enriching the TelecomSignal with tier and anomaly.
    // If the intention is to generate *separate* SignalEvent objects for specific events,
    // the logic below would need to be adjusted accordingly.
    // Assuming the goal is to add tier and anomaly to a processed version of TelecomSignal:
     signalEvents.push({
       timestamp: signal.timestamp,
       source: signal.source,
       signalType: signal.signalType,
       strength: signal.strength,
       region: signal.region,
       tier,
       anomaly,
     });
  });

  // Calculate average strength for each group
  for (const groupKey in signalGroups) {
    if (signalGroups.hasOwnProperty(groupKey)) {
      signalStrengthMap[groupKey] =
        signalGroups[groupKey].totalStrength / signalGroups[groupKey].count;
    }
  }

  // TODO: Implement more sophisticated signal event detection (e.g., sudden changes) if separate SignalEvent objects are needed

  return { signalStrengthMap, signalEvents };
}

// You can add helper functions here if needed, e.g., for change detection
// function detectSignalChanges(previousSignals: TelecomSignal[], currentSignals: TelecomSignal[]): SignalEvent[] {
//   // ... logic to compare and find significant changes
//   return [];
// }