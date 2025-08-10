function insureRitual(ritualId: string, stake: number): InsurancePolicy {
  return {
    policyId: `policy_${Date.now()}`,
    ritualId,
    stake,
    coverage: stake * 1.5,
    status: 'active',
  };
}