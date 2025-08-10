function simulateEconomy(params: EconomyParams): SimulationResult {
  const projectedTokens = params.strategistCount * params.ritualFrequency * params.tokenInflation;
  const driftRisk = params.ritualFrequency > 10 ? 'elevated' : 'stable';

  return {
    projectedTokens,
    driftRisk,
  };
}