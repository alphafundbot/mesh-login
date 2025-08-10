import { Insight, StrategistEmotion, Node, Ritual, DreamTrace } from './types'; // Assuming types are defined here

import { logTelemetryEvent } from '../monitoring/LoginTelemetry';
declare const meshManifest: { [key: string]: Node }; // Assume meshManifest is globally available or imported
declare const strategistDreamModel: { trace: (nodeId: string) => DreamTrace | undefined }; // Assume strategistDreamModel is globally available or imported

/**
 * Generates recursive, personalized insights based on mesh state, strategist history, and dream overlays.
 * @param params - Parameters for insight generation.
 * @returns An Insight object with summary, dream echo, and monetization hint.
 */
export function generateInsight(params: {
  nodeId: string;
  emotion: StrategistEmotion;
  ritualHistory: Ritual[];
}): Insight {
  logTelemetryEvent('insight:generate_start', {
    metadata: {
      nodeId: params.nodeId,
      emotion: params.emotion,
      ritualHistoryLength: params.ritualHistory.length,
    },
  });
  const { nodeId, emotion, ritualHistory } = params;

  const signal = meshManifest[nodeId];
  const dreamTrace = strategistDreamModel.trace(nodeId);

  const summary = `Node ${nodeId} is pulsing with ${signal.health > 0.8 ? 'sovereign clarity' : 'latent drift'} (Health: ${signal.health.toFixed(2)})`;
  const dreamEcho = dreamTrace?.emotion || 'neutral';
  const monetizationHint = signal.revenue > 500 ? '🔥 High-yield node' : '🧊 Low monetization';

  const insight: Insight = {
    summary,
    dreamEcho,
    monetizationHint,
    nodeId, // Include nodeId for potential drill-down
    // Add other relevant data points based on ritualHistory or other factors
  };
}
  logTelemetryEvent('insight:generate_end', { metadata: { insight: insight } });
 return insight;