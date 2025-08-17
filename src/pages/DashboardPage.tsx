import React, { useEffect, useMemo, useState } from "react";
import MeshThemeProvider from "../components/theme/MeshThemeProvider";
import MeshDashboardGrid from "../components/layout/MeshDashboardGrid";
import {
  MeshStatusCard,
  ProvisioningHeatmap,
  AuditTrailPanel,
  SignalFlowGraph,
  PerformanceMetricsPanel,
  MeshControlBar,
  ModuleSelector,
  MeshHUDPanel,
  InsightSelector,
  AxiomInterface,
  StrategicOutcomePanel,
  TranscendenceMonitor
} from "../components/ui";
import {
  MeshGlobe,
  PsychMap2D,
  PsychPulse3D,
  NDimensionalInsight
} from "../components/visualization";

// -- Strategic Registry for subTypes (optional, extensible) --
const insightSubTypes = [
  "emotional",
  "cognitive",
  "symbolic",
  "subconscious_flow",
] as const;
type InsightSubType = typeof insightSubTypes[number];

// -- Alias for insight type --
type InsightType = {
  type: "operational" | "psychographic";
  subType?: InsightSubType;
};

// --- Helpers ---
const isInsightType = (v: string | null): v is InsightType["type"] =>
  v === "operational" || v === "psychographic";

const isSubType = (v: string | null): v is InsightSubType =>
  !!v && (insightSubTypes as readonly string[]).includes(v);

// --- Live audit count (polls API when available, silent fallback) ---
function useAuditCount(pollMs = 5000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let alive = true;
    let id: number | undefined;

    const tick = async () => {
      try {
        const res = await fetch("/api/audit/count", { cache: "no-store" });
        if (!res.ok) throw new Error("bad status");
        const data = await res.json();
        if (alive) setCount(Number(data?.count ?? 0));
      } catch {
        // stay quiet if API not ready
      }
    };

    tick();
    id = window.setInterval(tick, pollMs);

    return () => {
      alive = false;
      if (id) clearInterval(id);
    };
  }, [pollMs]);

  return count;
}

const DashboardPage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [insightType, setInsightType] = useState<InsightType>({ type: "operational" });

  // Live audit density (replace API route when backend is ready)
  const auditEventsCount = useAuditCount(4000);

  // --- SSR-safe localStorage + URL param sync (module + insight) ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const urlModule = url.searchParams.get("module");
    const urlInsight = url.searchParams.get("insight");
    const urlSub = url.searchParams.get("subType");

    const storedModule = window.localStorage.getItem("selectedModule");

    if (urlModule) setSelectedModule(urlModule);
    else if (storedModule) setSelectedModule(storedModule);

    if (isInsightType(urlInsight)) {
      setInsightType({
        type: urlInsight,
        subType: urlInsight === "psychographic"
          ? (isSubType(urlSub) ? urlSub : "emotional")
          : undefined,
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Persist module
    if (selectedModule) {
      window.localStorage.setItem("selectedModule", selectedModule);
    } else {
      window.localStorage.removeItem("selectedModule");
    }

    // Sync URL
    const url = new URL(window.location.href);

    if (selectedModule) url.searchParams.set("module", selectedModule);
    else url.searchParams.delete("module");

    url.searchParams.set("insight", insightType.type);

    if (insightType.type === "psychographic") {
      url.searchParams.set("subType", insightType.subType ?? "emotional");
    } else {
      url.searchParams.delete("subType");
    }

    window.history.replaceState({}, "", url.toString());
  }, [selectedModule, insightType]);

  // Fallback globe UI (memoized)
  const globe = useMemo(
    () =>
      selectedModule ? (
        <MeshGlobe selectedModule={selectedModule} />
      ) : (
        <div className="dashboard-fallback-globe animate-pulse">
          <MeshGlobe selectedModule={null} />
          <div className="dashboard-fallback-message">
            <em>Select a module to explore operational insights.</em>
          </div>
        </div>
      ),
    [selectedModule]
  );

  return (
    <MeshThemeProvider>
      <MeshDashboardGrid>
        <InsightSelector
          onSelectInsightType={setInsightType}
          subTypes={insightSubTypes}
        />

        {insightType.type === "operational" && (
          <ModuleSelector onSelectModule={setSelectedModule} />
        )}

        {insightType.type === "operational" ? (
          globe
        ) : (
          <>
            <PsychMap2D
              key={`map-${insightType.subType ?? "emotional"}`}
              data={{}}
              type={insightType.subType || "emotional"}
            />
            <PsychPulse3D
              key={`pulse-${insightType.subType ?? "subconscious_flow"}`}
              data={{}}
              intensity={1}
              pulseRate={0.01}
              type={insightType.subType || "subconscious_flow"}
            />
          </>
        )}

        <MeshHUDPanel
          uptime="99.999%"
          auditDensity={auditEventsCount}
          signalHealth="Stable"
          selectedModule={selectedModule || "None Selected"}
        />

        <MeshStatusCard />
        <ProvisioningHeatmap />
        <AuditTrailPanel />
        <SignalFlowGraph />
        <PerformanceMetricsPanel />
        <MeshControlBar />
      </MeshDashboardGrid>

      <NDimensionalInsight />
      <AxiomInterface />
      <StrategicOutcomePanel />
      <TranscendenceMonitor />
    </MeshThemeProvider>
  );
};

export default DashboardPage;