// src/rituals/SuiteRitualScheduler.ts

interface ScheduledSuiteRitual {
  suiteName: string;
  ritual: any; // Assume ritual structure is defined elsewhere
  epoch: string;
  archetype: string;
}

const suiteRituals: ScheduledSuiteRitual[] = [];

export function scheduleSuiteRitual(suiteName: string, ritual: any, epoch: string, archetype: string): void {
  suiteRituals.push({ suiteName, ritual, epoch, archetype });
}

export function getRitualsForSuite(suiteName: string): any[] {
  return suiteRituals
    .filter(scheduledRitual => scheduledRitual.suiteName === suiteName)
    .map(scheduledRitual => scheduledRitual.ritual);
}
// src/rituals/SuiteRitualScheduler.ts

interface ScheduledSuiteRitual {
  suiteName: string;
  ritual: any; // Assume ritual structure is defined elsewhere
  epoch: string;
  archetype: string;
}

const suiteRituals: ScheduledSuiteRitual[] = [];

export function scheduleSuiteRitual(suiteName: string, ritual: any, epoch: string, archetype: string): void {
  suiteRituals.push({ suiteName, ritual, epoch, archetype });
}

export function getRitualsForSuite(suiteName: string): any[] {
  return suiteRituals
    .filter(scheduledRitual => scheduledRitual.suiteName === suiteName)
    .map(scheduledRitual => scheduledRitual.ritual);
}