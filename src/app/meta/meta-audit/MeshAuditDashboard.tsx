import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Assuming shadcn/ui tooltip

// Placeholder functions/data for hydration and interaction
const getSovereigntyStatus = () => Math.random() > 0.1 ? 'aligned' : 'drift';
const getQuotaHydration = () => Math.random(); // 0 to 1
const getOverrideStatus = () => ['executed', 'pending', 'failed'][Math.floor(Math.random() * 3)];
const getObservabilityDepth = () => Math.floor(Math.random() * 5) + 1; // 1 to 5

const getGeminiListeningState = () => Math.random() > 0.05 ? 'listening' : 'silent';
const getDecisionRationale = () => ({ branchDepth: Math.floor(Math.random() * 10), orphaned: Math.random() > 0.9 });
const getRitualExecutionStatus = () => ({ executed: Math.floor(Math.random() * 100), skipped: Math.floor(Math.random() * 5) });
const getMemoryFidelity = () => Math.random(); // 0 to 1

const getDriftDetection = () => Math.random() > 0.95;
const getLatencyBounds = () => Math.random() > 0.9; // true if breached
const getSignalIntegrity = () => Math.random(); // 0 to 1 (1 is high)
const getEnvironmentAlignment = () => Math.random() > 0.02 ? 'synced' : 'misaligned';

const getConsensusStatus = () => Math.floor(Math.random() * 5) + 1; // Number of domains in agreement
const getRollbackStatus = () => ['none', 'pending', 'executed', 'blocked'][Math.floor(Math.random() * 4)];
const getOverrideLogs = () => Math.floor(Math.random() * 20); // Number of recent logs
const getEvolutionMilestones = () => Math.floor(Math.random() * 50); // Number of milestones

// Helper components for glyphs and visuals
const SovereigntyRing: React.FC<{ status: string }> = ({ status }) => (
  <motion.div
    className={`w-12 h-12 rounded-full ${status === 'aligned' ? 'bg-green-500' : 'bg-red-500'} opacity-70 transition-all duration-500`}
    animate={{ scale: status === 'drift' ? [1, 1.1, 1] : 1 }}
    transition={{ duration: 1, repeat: Infinity }}
  />
);

const QuotaWaveform: React.FC<{ hydration: number }> = ({ hydration }) => (
  <div className="w-16 h-8 relative overflow-hidden">
    <motion.div
      className="absolute bottom-0 left-0 w-full bg-blue-500 opacity-70"
      initial={{ height: 0 }}
      animate={{ height: `${hydration * 100}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

const OverrideSigil: React.FC<{ status: string }> = ({ status }) => {
  const color = status === 'executed' ? 'bg-green-500' : status === 'pending' ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className={`w-6 h-6 rounded-sm ${color} opacity-70`}></div>
  );
};

const OverlayDensityMap: React.FC<{ depth: number }> = ({ depth }) => {
  const color = depth > 3 ? 'bg-red-500' : depth > 1 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    // Simple div for now, add complex visuals later
    <div className={`w-10 h-10 rounded-full ${color} opacity-70 transition-all duration-500`}></div>
  );
};


const SignalLoop: React.FC<{ state: string }> = ({ state }) => (
  <motion.div
    className={`w-8 h-8 rounded-full border-2 ${state === 'listening' ? 'border-green-500' : 'border-gray-500'}`}
    animate={{ rotate: state === 'listening' ? 360 : 0 }}
    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
  />
);

const LogicTree: React.FC<{ depth: number, orphaned: boolean }> = ({ depth, orphaned }) => (
  <div className="w-16 h-8 relative flex items-end justify-center">
    {Array.from({ length: depth }).map((_, i) => (
      <div key={i} className={`w-1 h-${i + 1} bg-purple-500 ${orphaned && i === depth - 1 ? 'opacity-30' : 'opacity-70'}`}></div>
    ))}
  </div>
);

const RitualTimeline: React.FC<{ executed: number, skipped: number }> = ({ executed, skipped }) => (
  <div className="flex items-center">
    <div className="text-green-500 mr-1">{executed}</div>
    <div className="text-red-500">{skipped}</div>
  </div>
);

const MemorySpiral: React.FC<{ fidelity: number }> = ({ fidelity }) => (
  <div className="w-8 h-8 relative">
    <motion.div
      className="absolute inset-0 border border-blue-500 rounded-full"
      animate={{ scale: fidelity }}
      transition={{ duration: 1 }}
    />
  </div>
);


const DriftRadar: React.FC<{ active: boolean }> = ({ active }) => (
  <motion.div
    className={`w-10 h-10 rounded-full border-2 ${active ? 'border-orange-500' : 'border-gray-500'}`}
    animate={{ rotate: active ? 360 : 0 }}
    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
  />
);

const LatencyGraph: React.FC<{ breached: boolean }> = ({ breached }) => (
  <div className={`w-16 h-8 ${breached ? 'bg-red-500' : 'bg-green-500'} opacity-70`}></div>
);

const SignalWaveform: React.FC<{ integrity: number }> = ({ integrity }) => (
  <div className="w-16 h-8 relative overflow-hidden">
    <motion.div
      className="absolute bottom-0 left-0 w-full bg-yellow-500 opacity-70"
      initial={{ height: 0 }}
      animate={{ height: `${integrity * 100}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

const AlignmentMap: React.FC<{ status: string }> = ({ status }) => (
  <div className={`w-10 h-10 rounded-full ${status === 'synced' ? 'bg-green-500' : 'bg-red-500'} opacity-70`}></div>
); // Simple div for now



const ConsensusRing: React.FC<{ agreement: number }> = ({ agreement }) => (
  <div className="w-12 h-12 relative">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className={`absolute inset-0 border rounded-full ${i < agreement ? 'border-teal-500' : 'border-gray-500'} opacity-70`}></div>
    ))}
  </div>
);

const RollbackTracker: React.FC<{ status: string }> = ({ status }) => (
  <div className={`px-2 py-1 rounded ${status === 'none' ? 'bg-gray-500' : status === 'pending' ? 'bg-yellow-500' : status === 'executed' ? 'bg-green-500' : 'bg-red-500'} opacity-70`}>
    {status}
  </div>
);

const OverrideLedger: React.FC<{ logs: number }> = ({ logs }) => (
  <div className="text-lg text-blue-500">{logs}</div>
);

const EvolutionArc: React.FC<{ milestones: number }> = ({ milestones }) => (
  // Simple div for now, add complex visual representation later
  <div className="w-16 h-8 relative border-b border-l border-purple-500 rounded-bl-full opacity-70">
    <div className="absolute bottom-0 left-0 text-xs text-purple-500">{milestones}</div>
  </div>
);

// Placeholder for recursion depth indicator
const RecursionDepthIndicator: React.FC<{ depth: number }> = ({ depth }) => (
  <div className="absolute top-2 right-2 text-xs text-gray-400">R:{depth}</div>
); // Simple text indicator

// Helper function for dynamic control point calculation
function getControlPoint(start: { x: number; y: number }, end: { x: number; y: number }, latency: number, weight: number) {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const curvatureFactor = Math.min(latency / 200, 1) * 0.5 + weight * 0.1; // Adjusted latency scaling
  const offset = distance * curvatureFactor * 0.2; // Control the intensity of curvature

  // Calculate a point perpendicular to the line connecting start and end points
  const controlPointX = midX + (-dy * offset) / distance;
  const controlPointY = midY + (dx * offset) / distance;

  return {
    x: controlPointX,
    y: controlPointY,
  };
}

// Helper functions for visual mapping (implement color gradients and thickness scales)
function getLatencyColor(latency: number): string {
  // Implement a color gradient logic (e.g., green to red)
  return latency < 50 ? 'green' : latency < 200 ? 'yellow' : 'red'; // Placeholder logic
}

function getWeightThickness(weight: number): number {
  // Implement a thickness scale logic
  return 1 + weight * 0.5; // Placeholder logic
}


// Placeholder simulation functions for meta-layer (Moved from inside component)
const simulateDependencies = () => { /* Fetch/simulate dependency data */
  // Return placeholder dependency data with weight, latency, and type
  return {
    'selfheal': [ { target: 'rollback', weight: 2, latency: 50, type: 'dynamic' }, { target: 'signals', weight: 1, latency: 30, type: 'static' } ],
    'rollback': [ { target: 'signals', weight: 3, latency: 150, type: 'dynamic' } ],
    'audit-engine': [ { target: 'compliance', weight: 1, latency: 20, type: 'static' }, { target: 'monitoring', weight: 2, latency: 40, type: 'dynamic' } ],
    'compliance': [],
    'monitoring': [ { target: 'anomaly', weight: 3, latency: 80, type: 'anomaly-bound' } ],
    'anomaly': [],
    // Add more simulated dependencies here with weight, latency, and type
  };
};


// Placeholder for trace overlay (simplified visual)
const TraceOverlay: React.FC<{ density: 'low' | 'medium' | 'high', children: React.ReactNode }> = ({ density, children }) => {
  const opacity = density === 'low' ? 0.1 : density === 'medium' ? 0.3 : 0.5;
  const color = density === 'low' ? 'bg-blue-500' : density === 'medium' ? 'bg-yellow-500' : 'bg-red-500';
  return (
    // Simple colored overlay for now, add dynamic trace visuals later
    <div className={`relative w-full h-full ${color} transition-opacity duration-500`} style={{ opacity }}>
      <div className="relative z-10 p-4">{children}</div>
    </div>
  );
};

const MeshAuditDashboard: React.FC = () => {
  // Mesh Pulse State (Anomaly-Bound)
  const [sovereigntyStatus, setSovereigntyStatus] = useState(getSovereigntyStatus());
  const [quotaHydration, setQuotaHydration] = useState(getQuotaHydration());
  const [overrideStatus, setOverrideStatus] = useState(getOverrideStatus());
  const [observabilityDepth, setObservabilityDepth] = useState(getObservabilityDepth());
  const [meshPulseDensity, setMeshPulseDensity] = useState<'low' | 'medium' | 'high'>('low');

  // Intelligence Flow State (Ritual-Triggered - simulated with interval)
  const [geminiListeningState, setGeminiListeningState] = useState(getGeminiListeningState());
  const [decisionRationale, setDecisionRationale] = useState(getDecisionRationale());
  const [ritualExecutionStatus, setRitualExecutionStatus] = useState(getRitualExecutionStatus());
  const [memoryFidelity, setMemoryFidelity] = useState(getMemoryFidelity());
  const [intelligenceFlowDensity, setIntelligenceFlowDensity] = useState<'low' | 'medium' | 'high'>('low');

  // Anomaly Scan State (Anomaly-Bound)
  const [driftDetection, setDriftDetection] = useState(getDriftDetection());
  const [latencyBounds, setLatencyBounds] = useState(getLatencyBounds());
  const [signalIntegrity, setSignalIntegrity] = useState(getSignalIntegrity());
  const [environmentAlignment, setEnvironmentAlignment] = useState(getEnvironmentAlignment());
  const [anomalyScanDensity, setAnomalyScanDensity] = useState<'low' | 'medium' | 'high'>('low');

  // Governance Layer State (Ritual-Triggered - simulated with interval)
  const [consensusStatus, setConsensusStatus] = useState(getConsensusStatus());
  const [rollbackStatus, setRollbackStatus] = useState(getRollbackStatus());
  const [overrideLogs, setOverrideLogs] = useState(getOverrideLogs());
  const [evolutionMilestones, setEvolutionMilestones] = useState(getEvolutionMilestones());
  const [governanceLayerDensity, setGovernanceLayerDensity] = useState<'low' | 'medium' | 'high'>('low');

  // Real-Time Echo Stream State
  const [echoStreamActive, setEchoStreamActive] = useState(true); // Optional: toggle this
  const [ambientDensity, setAmbientDensity] = useState<'low' | 'medium' | 'high'>('low');

  // Simulate Anomaly-Bound Cadence
  useEffect(() => {
    const interval = setInterval(() => {
      const newSovereignty = getSovereigntyStatus();
      const newQuota = getQuotaHydration();
      const newOverride = getOverrideStatus();
      const newObservability = getObservabilityDepth();
      const newDrift = getDriftDetection();
      const newLatency = getLatencyBounds();
      const newSignal = getSignalIntegrity();
      const newEnvironment = getEnvironmentAlignment();

      let density: 'low' | 'medium' | 'high' = 'low';
      if (newSovereignty === 'drift' || newQuota < 0.2 || newOverride === 'failed' || newObservability > 3 || newDrift || newLatency || newSignal < 0.5 || newEnvironment === 'misaligned') {
        density = 'high';
      } else if (newQuota < 0.5 || newObservability > 2 || newSignal < 0.8) {
        density = 'medium';
      }

      setSovereigntyStatus(newSovereignty);
      setQuotaHydration(newQuota);
      setOverrideStatus(newOverride);
      setObservabilityDepth(newObservability);
      setAnomalyScanDensity(density);
      setMeshPulseDensity(density); // Mesh Pulse is also Anomaly-Bound

      setDriftDetection(newDrift);
      setLatencyBounds(newLatency);
      setSignalIntegrity(newSignal);
      setEnvironmentAlignment(newEnvironment);

      // Ambient density based on overall system state (simplified)
      if (echoStreamActive && density === 'low') {
         setAmbientDensity('low');
      } else if (echoStreamActive && density === 'medium') {
         setAmbientDensity('medium');
      } else if (echoStreamActive && density === 'high') {
         setAmbientDensity('high');
      } else if (!echoStreamActive) {
         setAmbientDensity('low'); // Ambient low when stream inactive
      }

    }, 2000); // Anomaly-Bound check interval

    return () => clearInterval(interval);
  }, [echoStreamActive]);

  // Simulate Ritual-Triggered Cadence
  useEffect(() => {
    // Simulate ritual triggers periodically for demo purposes
    // In a real Mesh, these would be triggered by actual ritual completion events
    const ritualTriggerInterval = setInterval(() => {

      const newGemini = getGeminiListeningState();
      const newRationale = getDecisionRationale();
      const newRitual = getRitualExecutionStatus();
      const newMemory = getMemoryFidelity();
      const newConsensus = getConsensusStatus();
      const newRollback = getRollbackStatus();
      const newLogs = getOverrideLogs();
      const newMilestones = getEvolutionMilestones();

       let density: 'low' | 'medium' | 'high' = 'low';
       if (newGemini === 'silent' || newRationale.orphaned || newRitual.skipped > 0 || newMemory < 0.5 || newConsensus < 5 || newRollback !== 'none' || newLogs > 15 || newMilestones % 5 === 0) {
         density = 'high';
       } else if (newRationale.branchDepth < 3 || newRitual.skipped > 0 || newConsensus < 3 || newLogs > 10) {
         density = 'medium';
       }


      setGeminiListeningState(newGemini);
      setDecisionRationale(newRationale);
      setRitualExecutionStatus(newRitual);
      setMemoryFidelity(newMemory);
      setIntelligenceFlowDensity(density); // Intelligence Flow is Ritual-Triggered

      setConsensusStatus(newConsensus);
      setRollbackStatus(newRollback);
      setOverrideLogs(newLogs);
      setEvolutionMilestones(newMilestones);
      setGovernanceLayerDensity(density); // Governance Layer is also Ritual-Triggered

    }, 5000); // Simulate ritual triggers every 5 seconds
    return () => clearInterval(ritualTriggerInterval);
  }, []);

  // New state for meta-layer
  const [metaLayerState, setMetaLayerState] = useState({
    isVisible: true,
    density: 'medium',
    focusMode: 'dependencies' as 'dependencies' | 'lineage' | 'influence',
    dependencies: simulateDependencies(), // Initialize with simulated data
    ritualLineage: {}, // Placeholder for ritual lineage data
    strategistInfluence: {}, // Placeholder for strategist influence data
    interactionMode: 'passive',
    modulePositions: {}, // State to store actual module glyph positions
  });

  // Function to simulate strategist invoking full recursion (example)
  const invokeFullRecursion = () => {
     setMeshPulseDensity('high');
     setIntelligenceFlowDensity('high');
     setAnomalyScanDensity('high');
     setGovernanceLayerDensity('high');
     setAmbientDensity('high');
     console.log("Strategist invoked full recursion.");
  };

  // Ref for the SVG element
  const svgRef = useRef<SVGSVGElement>(null); // Specify SVGElement type

  // Refs for module glyph elements (These need to be attached to the actual glyph components)
  const selfHealRef = useRef<HTMLDivElement>(null);
  const rollbackRef = useRef<HTMLDivElement>(null);
  const signalsRef = useRef<HTMLDivElement>(null);
  const auditEngineRef = useRef<HTMLDivElement>(null);
  const complianceRef = useRef<HTMLDivElement>(null);
  const monitoringRef = useRef<HTMLDivElement>(null);
  const anomalyRef = useRef<HTMLDivElement>(null);
  // Add refs for all other module glyph elements

  // Effect to capture and update module glyph positions
  useEffect(() => {
    const updateModulePositions = () => {
      const positions: { [key: string]: { x: number; y: number } } = {};
      const svg = svgRef.current;

      if (!svg) return; // Only update if SVG ref is available

      const svgRect = svg.getBoundingClientRect();

      // Helper function to get the center coordinates of an element relative to the SVG container
      const getElementCenter = (element: HTMLElement) => {
          const rect = element.getBoundingClientRect();

          // Get the SVG's current transformation matrix
          const svgMatrix = svg.getScreenCTM();

          if (!svgMatrix) {
               return { x: 0, y: 0 }; // Fallback if matrix is not available
          }

          // Calculate the center of the element in viewport coordinates
          const elementCenterX = rect.left + rect.width / 2;
          const elementCenterY = rect.top + rect.height / 2;

          // Create an SVGPoint for the element's center in viewport coordinates
          const svgPoint = svg.createSVGPoint();
          svgPoint.x = elementCenterX;
          svgPoint.y = elementCenterY;

          // Transform the viewport coordinates to SVG canvas coordinates
          const svgCanvasPoint = svgPoint.matrixTransform(svgMatrix.inverse());

          return {
              x: svgCanvasPoint.x,
              y: svgCanvasPoint.y,
          };
      };

      // Get positions of rendered module glyph elements
      if (selfHealRef.current) positions['selfheal'] = getElementCenter(selfHealRef.current);
      if (rollbackRef.current) positions['rollback'] = getElementCenter(rollbackRef.current);
      if (signalsRef.current) positions['signals'] = getElementCenter(signalsRef.current);
      if (auditEngineRef.current) positions['audit-engine'] = getElementCenter(auditEngineRef.current);
      if (complianceRef.current) positions['compliance'] = getElementCenter(complianceRef.current);
      if (monitoringRef.current) positions['monitoring'] = getElementCenter(monitoringRef.current);
      if (anomalyRef.current) positions['anomaly'] = getElementCenter(anomalyRef.current);
      // Add logic to get positions for all other module glyph elements

      setMetaLayerState(prevState => ({ ...prevState, modulePositions: positions }));
    };

    // Update positions initially and on window resize
    updateModulePositions();
    window.addEventListener('resize', updateModulePositions);

    // Observe mutations to the DOM which might indicate layout shifts
    const observer = new MutationObserver(updateModulePositions);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });


    return () => {
      window.removeEventListener('resize', updateModulePositions);
      observer.disconnect(); // Clean up the observer
    };
  }, [svgRef.current]); // Re-run when SVG ref becomes available

  // Effect for rendering dependencies when data, focus mode, or module positions change
  useEffect(() => {
    if (metaLayerState.isVisible && metaLayerState.focusMode === 'dependencies' && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('path').remove(); // Clear previous paths

      const modulePositions = metaLayerState.modulePositions;

      // Render dependency lines/arcs
      Object.entries(metaLayerState.dependencies).forEach(([sourceModule, targetModules]) => {
        if (modulePositions[sourceModule]) {
          (targetModules as any[]).forEach(dependency => {
            const targetModule = dependency.target;
            const weight = dependency.weight || 1;
            const latency = dependency.latency || 0;
            const invocationType = dependency.type || 'static';

            if (modulePositions[targetModule]) {
              const sourcePos = modulePositions[sourceModule];
              const targetPos = modulePositions[targetModule];

              // Calculate control point dynamically
              const controlPoint = getControlPoint(sourcePos, targetPos, latency, weight);

              // Use D3 path generator for a quadratic curve
              const path = d3.path();
              path.moveTo(sourcePos.x, sourcePos.y);
              path.quadraticCurveTo(controlPoint.x, controlPoint.y, targetPos.x, targetPos.y);

              svg.append('path')
                .attr('d', path.toString())
                .attr('stroke', getLatencyColor(latency))
                .attr('stroke-width', getWeightThickness(weight))
                .attr('fill', 'none'); // No fill for lines

              // Apply line style based on invocation type
              if (invocationType === 'dashed') {
                svg.select('path:last-child').style('stroke-dasharray', ('5, 5'));
              } else if (invocationType === 'pulsing') {
                // TODO: Implement pulsing animation on the path
              }

              // TODO: Implement ripple animation on invocation events
              // TODO: Refine curved path logic based on dependency type or latency (beyond initial implementation)
            }
          });
        }
      });
    }
  }, [metaLayerState.isVisible, metaLayerState.focusMode, metaLayerState.dependencies, metaLayerState.modulePositions]); // Add modulePositions as a dependency

  // Placeholder simulation functions (will be replaced with actual data fetching/event listeners)
  const simulateMeshPulseAnomalyBound = () => { /* Implement anomaly detection logic */ return {}; };
  const simulateAnomalyScanAnomalyBound = () => { /* Implement anomaly detection logic */ return {}; };
  const simulateIntelligenceFlowRitualTriggered = () => { /* Implement ritual trigger logic */ return {}; };
  const simulateGovernanceLayerRitualTriggered = () => { /* Implement ritual trigger logic */ return {}; };
  const simulateRealTimeEcho = () => { /* Implement real-time telemetry */ return {}; };

  // Placeholder simulation functions for meta-layer (Moved from inside component)
  const simulateRitualLineage = () => { /* Fetch/simulate ritual lineage data */ return {}; };
  const simulateStrategistInfluence = () => { /* Fetch/simulate strategist influence data */ return {}; };

  // Function to toggle meta-layer visibility (placeholder)
  const toggleMetaLayerVisibility = () => {
    setMetaLayerState(prevState => ({ ...prevState, isVisible: !prevState.isVisible }));
  };

  // Function to change meta-layer focus mode (placeholder)
  const setMetaLayerFocusMode = (mode: 'dependencies' | 'lineage' | 'influence') => {
    setMetaLayerState(prevState => ({ ...prevState, focusMode: mode }));
  };


  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 w-full h-full">
        {/* Mesh Pulse Quadrant */}
        <TraceOverlay density={echoStreamActive ? ambientDensity : meshPulseDensity}>
           <div className="relative border p-4 flex flex-col justify-between h-full">
             <h3 className="text-lg font-semibold">🜂 Mesh Pulse</h3>
             <RecursionDepthIndicator depth={observabilityDepth} /> {/* Using observability depth for recursion indicator */}
             <div className="flex items-center space-x-4">
               <SovereigntyRing status={sovereigntyStatus} /> {/* Sovereignty Ring Glyph */}
               <Tooltip>
                 <TooltipTrigger><QuotaWaveform hydration={quotaHydration} /></TooltipTrigger>
                 <TooltipContent>Quota Hydration: {(quotaHydration * 100).toFixed(2)}%</TooltipContent>
               </Tooltip>
                <Tooltip>
                 <TooltipTrigger><OverrideSigil status={overrideStatus} /></TooltipTrigger>
                 <TooltipContent>Override Status: {overrideStatus}</TooltipContent>
               </Tooltip>
               <Tooltip>
                 <TooltipTrigger><OverlayDensityMap depth={observabilityDepth} /></TooltipTrigger>
                 <TooltipContent>Observability Depth: {observabilityDepth}</TooltipContent>
               </Tooltip>
             </div>
             {/* Placeholder for future interaction */}
             {/* <button onClick={invokeFullRecursion}>Inspect</button> */}
           </div>
        </TraceOverlay>

        {/* Intelligence Flow Quadrant */}
        <TraceOverlay density={echoStreamActive ? ambientDensity : intelligenceFlowDensity}>
          <div className="relative border p-4 flex flex-col justify-between h-full">
            <h3 className="text-lg font-semibold">🜁 Intelligence Flow</h3>
            <RecursionDepthIndicator depth={decisionRationale.branchDepth} /> {/* Using logic tree depth */}
             <div className="flex items-center space-x-4">
               <Tooltip>
                 <TooltipTrigger><SignalLoop state={geminiListeningState} /></TooltipTrigger>
                 <TooltipContent>Gemini State: {geminiListeningState}</TooltipContent>
               </Tooltip>
               <Tooltip>
                 <TooltipTrigger><LogicTree depth={decisionRationale.branchDepth} orphaned={decisionRationale.orphaned} /></TooltipTrigger>
                 <TooltipContent>Logic Tree Depth: {decisionRationale.branchDepth}, Orphaned Rationale: {decisionRationale.orphaned ? 'Yes' : 'No'}</TooltipContent>
               </Tooltip>
               <Tooltip>
                 <TooltipTrigger><RitualTimeline executed={ritualExecutionStatus.executed} skipped={ritualExecutionStatus.skipped} /></TooltipTrigger> {/* Ritual Timeline Visual */}
                 <TooltipContent>Rituals Executed: {ritualExecutionStatus.executed}, Skipped: {ritualExecutionStatus.skipped}</TooltipContent>
               </Tooltip>
              <Tooltip>
                 <TooltipTrigger><MemorySpiral fidelity={memoryFidelity} /></TooltipTrigger>
                 <TooltipContent>Memory Fidelity: {(memoryFidelity * 100).toFixed(2)}%</TooltipContent>
               </Tooltip>
            </div>
          </div>
        </TraceOverlay>

        {/* Anomaly Scan Quadrant */}
        <TraceOverlay density={echoStreamActive ? ambientDensity : anomalyScanDensity}>
          <div className="relative border p-4 flex flex-col justify-between h-full">
            <h3 className="text-lg font-semibold">🜄 Anomaly Scan</h3>
            <RecursionDepthIndicator depth={driftDetection || latencyBounds ? 2 : 1} /> {/* Simple depth indicator */}
             <div className="flex items-center space-x-4">
               <Tooltip>
                 <TooltipTrigger><DriftRadar active={driftDetection} /></TooltipTrigger>
                 <TooltipContent>Drift Detected: {driftDetection ? 'Yes' : 'No'}</TooltipContent>
               </Tooltip>
               <Tooltip>
                 <TooltipTrigger><LatencyGraph breached={latencyBounds} /></TooltipTrigger>
                 <TooltipContent>Latency Breached: {latencyBounds ? 'Yes' : 'No'}</TooltipContent>
               </Tooltip>
               <Tooltip>
                 <TooltipTrigger><SignalWaveform integrity={signalIntegrity} /></TooltipTrigger>
                 <TooltipContent>Signal Integrity: {(signalIntegrity * 100).toFixed(2)}%</TooltipContent>
               </Tooltip>
               <Tooltip>
                 <TooltipTrigger><AlignmentMap status={environmentAlignment} /></TooltipTrigger>
                 <TooltipContent>Environment Alignment: {environmentAlignment}</TooltipContent>
               </Tooltip>
            </div>
          </div>
        </TraceOverlay>

        {/* Governance Layer Quadrant */}
        <TraceOverlay density={echoStreamActive ? ambientDensity : governanceLayerDensity}>
          <div className="relative border p-4 flex flex-col justify-between h-full">
            <h3 className="text-lg font-semibold">🜃 Governance Layer</h3>
             <RecursionDepthIndicator depth={consensusStatus} /> {/* Using consensus status as depth indicator */}
             <div className="flex items-center space-x-4">
              <Tooltip>
                 <TooltipTrigger><ConsensusRing agreement={consensusStatus} /></TooltipTrigger>
                 <TooltipContent>Consensus: {consensusStatus} domains</TooltipContent>
               </Tooltip>
               <Tooltip>
                 <TooltipTrigger><RollbackTracker status={rollbackStatus} /></TooltipTrigger>
                 <TooltipContent>Rollback Status: {rollbackStatus}</TooltipContent>
               </Tooltip>
               <Tooltip>
                 <TooltipTrigger><OverrideLedger logs={overrideLogs} /></TooltipTrigger>
                 <TooltipContent>Override Logs: {overrideLogs} entries</TooltipContent>
               </Tooltip>
               <Tooltip>
                 <TooltipTrigger><EvolutionArc milestones={evolutionMilestones} /></TooltipTrigger>
                 <TooltipContent>Evolution Milestones: {evolutionMilestones}</TooltipContent>
               </Tooltip>
            </div>
          </div>
        </TraceOverlay>

        {/* Strategist Interaction Area (Placeholder) */}
        <div className="col-span-1 md:col-span-2 border p-4">
           <h3 className="text-lg font-semibold">Strategist Console</h3>
           {/* Add controls for strategist interaction here */}
           {/* <button onClick={invokeFullRecursion} className="mt-2 p-2 bg-blue-500 text-white rounded">Invoke Full Recursion</button> */}
           {/* <label className="ml-4"><input type="checkbox" checked={echoStreamActive} onChange={() => setEchoStreamActive(!echoStreamActive)} /> Real-Time Echo Stream</label> */}
        </div>

      </div>
    </TooltipProvider>
  );
};

export default MeshAuditDashboard;