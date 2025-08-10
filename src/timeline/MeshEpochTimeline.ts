import { StrategistHistory, Epoch } from './types'; // Assuming types are in a types file

function generateEpochTimeline(history: StrategistHistory[]): Epoch[] {
  return history.map((entry, index) => {
    return {
      name: `Epoch ${index + 1}`,
      start: entry.timestamp,
      rituals: entry.ritualCount,
      dominantModule: entry.module,
    };
  });
}