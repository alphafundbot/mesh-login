// EpochalRitualScheduler.ts

interface Ritual {
  // Define the structure of a ritual object here
  // For example:
  name: string;
  command: string; // Ritual command string
  parameters?: any; // Optional parameters for the ritual
}

// Assume Strategist calendar and Epoch definition exist elsewhere.
// For example:
// type Epoch = string; // Could be "Genesis", "Ascension", etc.

const ritualSchedule: { [epoch: string]: Ritual[] } = {};

/**
 * Schedules a ritual to be executed during a specific epoch.
 * @param ritual The ritual object to schedule.
 * @param epoch The epoch to associate the ritual with.
 */
export function scheduleRitual(ritual: Ritual, epoch: string): void {
  if (!ritualSchedule[epoch]) {
    ritualSchedule[epoch] = [];
  }
  ritualSchedule[epoch].push(ritual);
}

/**
 * Retrieves all rituals scheduled for a given epoch.
 * @param epoch The epoch to retrieve rituals for.
 * @returns An array of ritual objects scheduled for the epoch, or an empty array if none exist.
 */
export function getRitualsForEpoch(epoch: string): Ritual[] {
  return ritualSchedule[epoch] || [];
}