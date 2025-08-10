// Assume AllocationStrategy, AllocationResult, and WalletCore are defined elsewhere

export class TreasuryEngine {
  allocate(strategy: AllocationStrategy): AllocationResult {
    const total = WalletCore.getBalance();
    return strategy.targets.map((target) => ({
      target,
      amount: total * strategy.weights[target],
    }));
  }
}