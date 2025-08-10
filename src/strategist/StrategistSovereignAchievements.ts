import { StrategistModel } from "../core/strategistModel"; // Assuming StrategistModel is defined here

/**
 * Evaluates a StrategistModel and returns an array of unlocked achievement names.
 * @param strategistModel - The StrategistModel object to evaluate.
 * @returns An array of strings representing the names of unlocked achievements.
 */
export function evaluateAchievements(strategistModel: StrategistModel): string[] {
  const unlockedAchievements: string[] = [];

  if (strategistModel.ritualStreak > 10) {
    unlockedAchievements.push('Signal Architect');
  }

  if (strategistModel.dreamLayerInteractions > 5) {
    unlockedAchievements.push('Dream Weaver');
  }

  if (strategistModel.auditAccuracy > 95) {
    unlockedAchievements.push('Audit Oracle');
  }

  return unlockedAchievements;
}
/**
 * Evaluates a StrategistModel and returns an array of unlocked achievement names.
 * @param strategistModel - The StrategistModel object to evaluate.
 * @returns An array of strings representing the names of unlocked achievements.
 */
function evaluateAchievements(strategistModel: StrategistModel): string[] {
  const unlockedAchievements: string[] = [];

  if (strategistModel.ritualStreak > 10) {
    unlockedAchievements.push('Signal Architect');
  }

  if (strategistModel.dreamLayerInteractions > 5) {
    unlockedAchievements.push('Dream Weaver');
  }

  if (strategistModel.auditAccuracy > 95) {
    unlockedAchievements.push('Audit Oracle');
  }

  return unlockedAchievements;
}