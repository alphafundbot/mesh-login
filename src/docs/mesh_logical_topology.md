# Mesh Logical Topology Overview

This document describes the intended logical architecture and interaction patterns of the core mesh modules.

## Key Modules:

-   **Destine-root:** (Python) Central control and orchestration module. Receives high-level strategic directives and translates them into actions across the mesh. Handles critical override triggers and system-wide state validation.
-   **MeshDashboard:** (Node.js/TypeScript) User interface for monitoring, managing, and interacting with the mesh. Provides visualizations, control panels, and access to system data.
-   **Firebase-proxy:** (Node.js/TypeScript) Acts as an intermediary, primarily for securely accessing external APIs (like Gemini) and potentially other backend services that the MeshDashboard or other modules interact with.
-   **Audit-engine:** (Python) Performs automated security, compliance, and operational audits across the mesh. Analyzes logs, configurations, and behavior to identify anomalies or violations.
-   **Autonomous Resource Manager:** (Planned - TypeScript/Node.js) Monitors resource utilization, analyzes needs, and autonomously manages resource allocation and scaling across the mesh infrastructure.
-   **IAMControlPanel:** (Planned - within MeshDashboard) Provides a UI for managing user roles, permissions, and service accounts.

## Interaction Patterns:

-   **Strategist (User) ↔ MeshDashboard:** Direct interaction via web interface. User views data, triggers actions, configures settings, and receives notifications. Access controlled by IAM roles defined in `src/lib/roles.ts`.
-   **MeshDashboard ↔ Backend APIs (via Next.js API routes):** All external and frontend interactions are funneled through the Next.js API routes, which act as a secure gateway. These routes enforce authentication and authorization before processing requests or interacting with backend modules.
-   **Backend APIs ↔ Modules:** Backend API routes call functions or services provided by core backend modules.
    -   API routes might call `firebase-proxy` functions to interact with external APIs.
    -   API routes might interact with the `Audit-engine` to trigger audits or retrieve audit results.
    -   API routes will interact with the `Autonomous Resource Manager` for resource data and controls (planned).
-   **Destine-root ↔ Modules:** Destine-root sends commands or signals to other modules to initiate actions (e.g., trigger audits in `Audit-engine`, potentially adjust parameters in `Autonomous Resource Manager` or future revenue modules). Destine-root receives status updates or alerts from modules.
-   **Audit-engine ↔ Other Modules/Resources:** The Audit-engine reads logs, configurations, or state directly from other modules, databases, or infrastructure components to perform its analysis. It reports findings back, potentially to Destine-root or logging systems.
-   **Autonomous Resource Manager ↔ Infrastructure/Cloud Providers:** The Autonomous Resource Manager interacts with underlying infrastructure or cloud provider APIs (via secure interfaces) to monitor resource usage and enact scaling or allocation changes. It reports resource status and optimization decisions.
-   **Modules ↔ Databases/Data Stores:** Modules access shared data stores (e.g., Firestore, other databases) for configuration, state, logs, and operational data. Access controlled by database security rules and service account permissions.
-   **Modules ↔ External Services:** Modules (primarily via `firebase-proxy` or dedicated integrations) interact with external services (Gemini API, planned financial platforms like Stripe/Metamask, telecommunications services). Access controlled by API keys, service accounts, and secure protocols.

## API Endpoints & Interaction Points

The primary entry point for external systems to interact with the mesh is through its Next.js API routes. Authentication is required, and actions are governed by the IAM roles defined in `src/lib/roles.ts`.

-   **`/api/status`**
    -   **Method:** GET
    -   **Purpose:** Provides health status for various internal and external APIs.
    -   **Required Permission:** `viewApiStatus`

-   **`/api/financial-data`**
    -   **Method:** GET
    -   **Purpose:** Retrieves financial metrics and data for the dashboard.
    -   **Required Permission:** `viewFinancials`

-   **`/api/gemini`**
    -   **Method:** POST
    -   **Purpose:** A proxy for making requests to the Gemini AI API. The request body should contain a `prompt` field.
    -   **Required Permission:** `useGeminiApi` (Note: This is a conceptual permission that needs to be defined in `src/lib/roles.ts` to be enforced.)

-   **`/api/health`**
    -   **Method:** GET
    -   **Purpose:** A simple, unauthenticated health check endpoint for the MeshDashboard service itself. Returns a 200 OK response if the service is running.
    -   **Required Permission:** None

This logical topology provides a framework for understanding how the different parts of the mesh are designed to work together. Future improvements will focus on hardening these interaction points and adding new modules to enhance capabilities and revenue generation.
