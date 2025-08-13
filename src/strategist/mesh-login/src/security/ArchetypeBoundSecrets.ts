// src/security/ArchetypeBoundSecrets.ts

// Assume SuiteSecrets are defined and can be imported or accessed
// import { SuiteSecrets } from './SuiteSecrets';

// Assume Archetype names are defined elsewhere
// type Archetype = "Architect" | "Hunter" | "Weaver" | "Oracle" | "Ritualist";

const ArchetypeSecretBindings: { [key: string]: string[] } = {
  Architect: ["firebase", "github", "cloudflare"],
  Hunter: ["upwork", "fiverr", "audit"], // Assuming 'audit' is a secret name or type
  Weaver: ["ui", "signal", "gumroad"], // Assuming 'ui' and 'signal' are secret names or types
  Oracle: ["AuditOracle", "dreamLayer", "whop"], // Assuming 'AuditOracle' and 'dreamLayer' are secret names or types
  Ritualist: ["SecretsRitualizer", "epochScheduler"], // Assuming 'SecretsRitualizer' and 'epochScheduler' are secret names or types
};

/**
 * Checks if a given strategist archetype is allowed to access a specific secret.
 * @param strategistArchetype The archetype of the strategist.
 * @param secretName The name of the secret being accessed.
 * @returns True if the archetype is allowed to access the secret, false otherwise.
 */
export function checkSecretAccess(strategistArchetype: string, secretName: string): boolean {
  const allowedSecrets = ArchetypeSecretBindings[strategistArchetype];

  if (!allowedSecrets) {
    // If the archetype is not defined in the bindings, perhaps deny access by default
    return false;
  }

  // Check if the requested secret name is in the list of allowed secrets for the archetype
  return allowedSecrets.includes(secretName);
}

// Optional: Function to validate if a secretName actually exists in SuiteSecrets
/*
function isValidSecretName(secretName: string): boolean {
  return Object.keys(SuiteSecrets).includes(secretName);
}
*/