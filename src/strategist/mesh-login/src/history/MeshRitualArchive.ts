interface Ritual {
  timestamp: number;
  action: string;
  insights: Insight[]; // Assuming Insight type is defined elsewhere
}

let ritualArchive: Ritual[] = [];
declare const logTelemetryEvent: (eventName: string, eventData?: Record<string, any>) => Promise<void>;

export function store(ritual: Ritual): void {
  ritualArchive.push(ritual);
}

export function useRitualArchive(): Ritual[] {
  return ritualArchive;
}