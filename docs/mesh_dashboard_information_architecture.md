
# MeshDashboard Information Architecture

This document outlines the information architecture and navigation structure of the MeshDashboard. It is presented in a hierarchical format, similar to a sitemap.

## Top-Level Navigation / Sidebar

- **Dashboard** (`/`)
  - Strategist HUD
  - Revenue Metrics
  - Revenue Chart
  - Currency Signal Module
  - Intelligence Map (Cross-Domain)
  - Visual Integrity Matrix (Forecasts, Momentum)
  - Omega Epoch Stream
  - Recent Activity
  - Port Audit
  - Mesh Hydration Audit
  - Role Selector

- **Signal Memory** (`/history`)
  - Historical Signal Logs
  - Filter/Search Capabilities
  - Log Details View
  - Correlation Analysis View (Planned)

- **Memory Map** (`/memory-map`)
  - Visual Representation of Mesh Knowledge/State
  - Connections and Relationships View
  - Key Data Points Visualization

- **Snapshots** (`/snapshots`)
  - Snapshot Registry (`/snapshots`)
    - List of Available Snapshots
    - Snapshot Details (`/snapshots/[slug]`)
      - Snapshot Content View
      - Metadata
      - Download/Export Options
  - Diff Snapshots (`/snapshots/diff`)
    - Comparison Interface for Two Snapshots
    - Highlight Differences (Code, Config, Data)

- **Forecast Archive** (`/forecast-archive`)
  - Historical Forecasts List
  - Forecast Details View
  - Comparison with Actuals (Planned)

- **Analysis**
  - **Audit Trail AI** (`/audit`)
    - AI-Analyzed Audit Logs
    - Anomaly Highlighting
    - Filter and Search
  - **Config Validator** (`/validator`)
    - Configuration File Validation Interface
    - Rule Management
    - Validation Results
  - **Analysis Archive** (`/analysis-archive`)
    - Archived Analysis Reports (Audit, Validation, etc.)
    - Search and Filter
    - Report Details View

- **System**
  - **API Status** (`/status`)
    - Status of Internal and External APIs
    - Health Checks Visualization
    - Latency and Error Rates
  - **API Management** (`/apis`)
    - List of Managed APIs
    - Endpoint Details
    - Configuration Options
  - **API Discovery** (`/discovery`)
    - Discoverable APIs in the Mesh and External Sources
    - Integration Options
  - **System Admin** (`/admin`)
    - Administrative Tools (e.g., Data Backfill Engine)
    - System Configuration (Restricted Access)
    - Module Management (Planned)
  - **Usage Dashboard** (`/usage`)
    - Resource Usage Metrics (CPU, Memory, Network)
    - Cost Monitoring (If applicable)
    - Usage Trends
  - **Synthesis Queue** (`/queue`)
    - View Pending and Completed AI Synthesis Tasks
    - Task Details and Status
  - **Simulator** (`/simulation`)
    - Mesh Simulation Environment
    - Scenario Configuration
    - Simulation Results Visualization

- **Meta**
  - **Code Intelligence** (`/meta/code-intelligence`)
    - AI-Powered Code Analysis
    - Code Vulnerability Scanning (Planned)
    - Code Structure Visualization
  - **Meta-Audit** (`/meta/meta-audit`)
    - Audit of the Audit Systems and Security Controls
    - Compliance Monitoring Dashboard
    - Security Posture Visualization

- **IAM Management** (`/dashboard/iam` - Planned Module Integration)
  - User Management (Planned)
  - Role Management
  - Service Account Management
  - Permission Configuration
  - IAM Audit Trail
  - IAM Drift Detection Visualization
  - Key Rotation Management

- **Resource Management** (`/dashboard/resources` - Planned Module Integration)
  - Resource Monitoring Dashboard
  - Resource Allocation Visualization
  - Scaling Controls
  - Optimization Recommendations (AI-Powered)
  - Resource Cost Analysis

- **Settings** (`/settings` - Placeholder)
  - User Profile
  - Preferences
  - Integrations Management (Limited)

- **Logout** (Action, often in sidebar/user menu)

## Potential Additions/Future Expansions

- Notifications/Alerts Center (Persistent element)
- Real-time Mesh Topology Map
- Integrated AI Chat/Command Interface
- Financial Trading Suite Interface (Integrated with Wallets/Exchanges)
- Telecom Management Interface
- Integrated Development Environment (for authorized roles)
