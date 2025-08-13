import { ElectricalIpInfo } from '../registry/globalIpRegistry';
import { logEvent } from '../orchestrator_log'; // Assuming this is your logging utility

export function simulateSignalInjection(ipInfo: ElectricalIpInfo): void {
  console.log(`Simulating signal injection to ${ipInfo.ipAddress} in ${ipInfo.region}...`);

  let simulatedOutcome: 'success' | 'failure' | 'warning_legal' = 'success';
  let details = `Simulated signal injection to ${ipInfo.ipAddress} (${ipInfo.infrastructureType}).`;

  // Simulate success/failure based on infrastructure type and region
  let successChance = 0.8; // Base success chance
  if (ipInfo.infrastructureType === 'transformer') {
    successChance -= 0.2; // Lower success chance for transformers
    details += ' (Infrastructure type: Transformer - potentially higher failure rate).';
  } else if (ipInfo.infrastructureType === 'substation') {
    successChance += 0.1; // Higher success chance for substations
    details += ' (Infrastructure type: Substation - potentially lower failure rate).';
  }

  if (ipInfo.legalStatus === 'no_framework') {
      successChance += 0.15; // Higher success chance in unregulated regions
      details += ' (Legal status: No framework - potentially easier injection).';
  }

  const injectionSuccessful = Math.random() < successChance;

  if (ipInfo.legalStatus === 'prohibited') {
    simulatedOutcome = 'warning_legal';
    details = `Simulated signal injection attempted to ${ipInfo.ipAddress}. Legal status is PROHIBITED. Injection simulation FAILED due to legal restrictions.`;
    console.warn(`⚠️ Legal restriction: Signal injection to ${ipInfo.ipAddress} is prohibited.`);
  } else if (injectionSuccessful) {
    simulatedOutcome = 'success';
    console.log(`✅ Simulated signal injection to ${ipInfo.ipAddress} successful based on simulation.`);
  } else {
    simulatedOutcome = 'failure';
    details = `Simulated signal injection to ${ipInfo.ipAddress} FAILED based on simulation factors.`;
    console.warn(`❌ Simulated signal injection to ${ipInfo.ipAddress} failed.`);
  }

  logEvent({
    event: 'simulated_signal_injection',
    ipAddress: ipInfo.ipAddress,
    region: ipInfo.region,
    legalStatus: ipInfo.legalStatus,
    simulatedOutcome: simulatedOutcome,
    timestamp: new Date().toISOString(),
    details: details,
  });
}