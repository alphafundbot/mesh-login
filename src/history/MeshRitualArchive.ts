interface Ritual {
  timestamp: number;
  action: string;
  insights: Insight[]; // Assuming Insight type is defined elsewhere
}

let ritualArchive: Ritual[] = [];

export function store(ritual: Ritual): void {
  ritualArchive.push(ritual);
}

export function useRitualArchive(): Ritual[] {
  return ritualArchive;
}