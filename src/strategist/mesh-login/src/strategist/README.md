# 🧠 Strategist Cockpit Overlays

This module contains sovereign UI panels for strategist-grade visibility, mutation traceability, and operational closure.

---

## 🧭 Strategist Component Overview (Refined)

Each component in this directory is a sovereign overlay within the Strategist Cockpit. They are modular, mutation-aware, and ceremony-ready.

| Component                   | Purpose                                                                 |
|----------------------------|-------------------------------------------------------------------------|
| `StrategistDashboard.jsx`  | 🧠 Aggregates all strategist overlays into a unified cockpit interface. |
| `SessionTracePanel.jsx`    | 🔍 Visualizes session mutations, identity lineage, and trace fidelity.  |
| `MonetizationPanel.jsx`    | 💰 Displays strategist funding flows, Stripe/NFT gates, and quota status. |
| `DeploymentStatusPanel.jsx`| 🚀 Shows deployment sync, rollback status, and audit-bound integrity.   |

---

## Components

### `StrategistDashboard.jsx`
- Aggregates all strategist overlays
- Entry point for cockpit rendering

### `SessionTracePanel.jsx`
- Displays session mutation lineage
- Hooks into `telemetry`, `session`, and `audit` modules

### `MonetizationPanel.jsx`
- Shows funding status, quota usage, and monetization flows
- Integrates with `Stripe`, `NFT`, and `wallet` overlays

### `DeploymentStatusPanel.jsx`
- Visualizes deployment sync, rollback status, and audit fidelity
- Pulls data from `deployment`, `audit`, and `rollback` modules

---

## Ritual Status

✅ Scaffolded  
🔜 Needs live data wiring  
🔜 Optional Tailwind styling  
🔜 Ready for cockpit hydration
