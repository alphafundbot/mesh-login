import { StrategistModel } from './StrategistModel'; // Assuming StrategistModel is defined elsewhere
import { Node } from '../lib/types'; // Assuming Node is defined elsewhere

interface ArenaZone {
  id: string;
  strategists: string[];
  sharedNodes: string[];
  ritualSync: boolean;
}

const arenaZones: ArenaZone[] = [];

export function createArenaZone({
  strategists,
  sharedNodes,
  ritualSync,
}: {
  strategists: string[];
  sharedNodes: string[];
  ritualSync: boolean;
}): ArenaZone {
  const newArenaZone: ArenaZone = {
    id: `arena_${arenaZones.length + 1}`,
    strategists,
    sharedNodes,
    ritualSync,
  };
  arenaZones.push(newArenaZone);
  return newArenaZone;
}

export function getArenaZone(id: string): ArenaZone | undefined {
  return arenaZones.find(zone => zone.id === id);
}

export function listArenaZones(): ArenaZone[] {
  return [...arenaZones];
}

// Additional functions for managing arena zones could be added here,
// e.g., addStrategistToZone, removeStrategistFromZone, addNodeToZone, removeNodeFromZone, etc.