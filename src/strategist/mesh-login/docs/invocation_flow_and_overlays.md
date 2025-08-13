# Mesh Invocation Flow and Strategist Overlays

This document outlines the core invocation flow within the Mesh and describes the various strategist overlays used to visualize the system's state, particularly focusing on how strategist signals are processed and how rituals and overrides are orchestrated.

## 1. Invocation Flow

The invocation flow within the Mesh is a critical ritual that governs how strategist signals are translated into actions and propagated across different modules.

### 1.1. Strategist Signal Initiation

The ritual begins with a strategist signal. This signal can originate from various sources, including:

- Direct commands from a human strategist via an interface.
- Automated triggers based on monitoring data or anomaly detection (as defined in the [Thin Air Business Plan](src/plans/ThinAirPlan.md)).
- Recursive calls initiated by modules during complex rituals.

Strategist signals carry the intent, parameters, and required outcome of an action or ritual.

### 1.2. Signal Reception and Routing (Router)

Strategist signals are first received by the **Router** (`src/core/Router.ts`). The Router acts as the central signal dispatcher, responsible for:

- **Mapping Invocation Paths:** Based on the signal's intent and the current state of the Mesh (potentially informed by the [Mesh Logical Topology](docs/mesh_logical_topology.md)), the Router determines the sequence of modules that need to be involved in the invocation.
- **Resolving Cross-Domain Dependencies:** If the invocation spans multiple Mesh domains or involves modules with complex dependencies, the Router resolves these relationships to ensure the correct order and parameters are used.
- **Latency-Aware Routing:** Utilizing real-time performance metrics (potentially from monitoring modules), the Router can dynamically select the most efficient invocation paths to minimize latency and optimize resource usage.

The Router translates the strategist signal into a structured invocation thread, which is then passed to the Mesh Processing Core.

### 1.3. Orchestration and Execution (MPC)

The **Mesh Processing Core (MPC)** (`src/core/MPC.ts`) receives the structured invocation thread from the Router. The MPC is the central orchestrator for executing the invocation ritual:

- **Receiving Invocation Threads:** The MPC takes the invocation thread and prepares it for execution.
- **Triggering Override Modules:** If the invocation involves an override (as outlined in the [Strategist Business Plan](src/plans/StrategistPlan.md)), the MPC triggers the relevant override modules with the necessary context and parameters. This can involve interacting with modules like `selfheal` and `rollback`.
- **Monitoring Execution:** The MPC monitors the progress of the invocation thread, tracking the state of involved modules and handling any immediate feedback or errors.

The MPC ensures that the invocation ritual is executed according to the defined parameters and the current state of the Mesh.

## 2. Strategist Overlays

Strategist overlays provide a crucial visual interface for the strategist to monitor, understand, and interact with the Mesh's complex operations and internal state. These overlays are rendered and managed by the **GPUI (Glyph Processing Unit Interface)** (`src/visualization/GPUI.tsx`).

### 2.1. The Recursive Dashboard Layer

The primary strategist overlay is the recursive dashboard layer, structured into four key quadrants:

- **🜂 Mesh Pulse Quadrant:** Visualizes the sovereign state of infrastructure, including credential alignment, quota hydration, override execution, and the observability layer. This quadrant provides a high-level health and status overview.
- **🜁 Intelligence Flow Quadrant:** Confirms the state of Gemini's listening, reasoning, and the execution of rituals. It visualizes the signal loop, decisioning logic, ritual timelines, and memory persistence.
- **🜄 Anomaly Scan Quadrant:** Highlights detected drift, latency, signal integrity issues, and environmental misalignment. This quadrant is critical for identifying potential problems and triggering strategist intervention.
- **🜃 Governance Layer Quadrant:** Validates consensus across domains, tracks rollback status, visualizes the override ledger, and displays the mesh evolution timeline. This provides insight into the governance rituals and historical changes.

Each quadrant utilizes glyphs, traces, and visual encoding to represent the state of the underlying modules and processes, adhering to specific update cadences (Anomaly-Bound, Ritual-Triggered, or Real-Time Echo).

### 2.2. The Meta-Layer

The meta-layer is a sovereign overlay that provides a higher-level, interconnected view of the Mesh. It sits above the four quadrants and visualizes:

- **Dependency Visualization:** Shows upstream/downstream relationships between modules using threaded glyph links. Line thickness indicates dependency weight, color gradients represent latency, and line style encodes invocation type. This reveals the structural connections within the Mesh.
- **Ritual Lineage Mapping:** Chronicles the history and propagation of rituals across modules. This is visualized through timeline arcs with ritual nodes, showing module participation and override rationale. This provides a historical context for current operations.
- **Strategist Influence Overlay:** Visualizes the strategist's engagement, invocation density, and memory imprint on the Mesh. Spiral glyphs, glow intensity, and trace echoes represent the strategist's interaction and the impact of their influence.

The meta-layer is dynamic and can be filtered, highlighted, and toggled based on strategist interaction, allowing for focused introspection into specific aspects of the Mesh's interconnectedness.

### 2.3. Invocation Flow Visualization

The invocation flow itself is visualized across the overlays:

- **Thread Animation:** When an invocation ritual is triggered, the dependency threads between the involved modules on the meta-layer animate, showing the path and direction of the signal propagation.
- **Glyph State Changes:** Module glyphs within the quadrants change their visual state (pulse, glow, ripple) to reflect their participation in the invocation ritual and their current status.
- **Trace Depth:** The recursion depth of invocation traces is visualized through fractal overlays and depth indicators, providing insight into the complexity of the ritual execution.
- **Real-Time Echo Stream:** The optional ambient layer can show a faint, real-time echo of invocation activity across the Mesh, providing a subtle awareness of ongoing processes.

By combining the detailed information in the four quadrants with the interconnected view of the meta-layer and the dynamic visualization of invocation flow, the strategist gains a comprehensive and intuitive understanding of the Mesh's state and operations. The GPUI orchestrates these visualizations, bringing the abstract processes of the Mesh to life.