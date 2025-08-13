import { StrategistModel } from './StrategistModel'; // Assuming StrategistModel is in the same directory or adjust path
import { SoulRecord, Essence } from './SoulRecord'; // Assuming SoulRecord is defined in SoulRecord.ts
import { MythEngine } from '../culture/StrategistMythEngine'; // Adjust path based on actual location

/**
 * Archives the essence of a strategist.
 * @param model The StrategistModel to archive.
 * @returns A SoulRecord representing the archived strategist essence.
 */
export function archiveSoul(model: StrategistModel): SoulRecord {
  const essence: Essence = {
    rituals: model.history, // Assuming history property holds rituals
    emotions: model.emotionalState,
    mythRole: MythEngine.getRole(model), // Assuming MythEngine.getRole exists and takes StrategistModel
  };

  return {
    strategistId: model.id,
    essence: essence,
    timestamp: Date.now(),
  };
}