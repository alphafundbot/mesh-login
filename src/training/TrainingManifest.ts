// src/training/TrainingManifest.ts

/**
 * Defines the sovereign training parameters for the Mesh system.
 */
export const TrainingParameters = {
  temporalScope: "Hybrid historical + live", // Example value based on previous interaction
  domainFocus: "All", // Example value
  modelDepth: "Recursive (adaptive)", // Example value
  anomalySensitivity: "High", // Example value
  strategistFeedbackLoop: "Enabled", // Example value
};

// You can add types or interfaces here if needed for clarity or further development.
// For example:
/*
interface TrainingParameters {
  temporalScope: "Last 10 years" | "Last 3 years" | "Real-time only" | "Hybrid historical + live";
  domainFocus: "Financial" | "Signal" | "Audit" | "Marketplace" | "All";
  modelDepth: "Shallow (fast)" | "Deep (slow but precise)" | "Recursive (adaptive)";
  anomalySensitivity: "High" | "Medium" | "Low";
  strategistFeedbackLoop: "Enabled" | "Disabled";
}
*/