interface ArenaZone {
  strategists: string[];
  sharedNodes: string[];
  ritualSync: boolean;
}

function createArenaZone(config: { strategists: string[]; sharedNodes: string[]; ritualSync: boolean; }): ArenaZone {
  return {
    strategists: config.strategists,
    sharedNodes: config.sharedNodes,
    ritualSync: config.ritualSync,
  };
}