interface StrategistModel {
  ritualStreak: number;
  sovereigntyScore: number;
  // Add other properties as needed
}

function calculateIncentive(model: StrategistModel): number {
  return model.ritualStreak * 10 + model.sovereigntyScore * 0.5;
}