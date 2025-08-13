Strategist, your command is received. I will create the `docs/mesh_dashboard_wireframe_resource_details_page.md` file with the specified text-based wireframe description for the individual Resource Details page. I will adhere to your instruction to **NOT** return a tool call. I will **JUST** return the requested markdown content.

```markdown
# Wireframe: Individual Resource Details Page

**Page Title:** Resource: [Resource Name/ID] (e.g., Resource: GCP-VM-Prod-001, Resource: Kubernetes-Node-XYZ)

**Overall Layout:**

*   Standard AppLayout with main navigation sidebar.
*   Main content area for displaying resource details.
*   Breadcrumbs at the top of the main content area: Dashboard > Resource Management > [Resource Name/ID]

**Key Sections:**

1.  **Overview/Summary (Top of content area):**
    *   Card displaying key summary information about the resource.
    *   Includes: Resource Name/ID, Type (e.g., VM, Container, Database), Status (e.g., Running, Stopped, Degraded), Associated Module/Service, Creation Date, Current Allocation (CPU, Memory, Disk).
    *   Might include a small status badge or icon.

2.  **Utilization Metrics (Below Overview):**
    *   Card containing charts and visualizations of resource utilization.
    *   Includes:
        *   **CPU Utilization Chart:** Line chart showing CPU usage over time (e.g., last hour, 24 hours, 7 days).
        *   **Memory Utilization Chart:** Line chart showing memory usage over time.
        *   **Disk Usage Chart:** Bar chart or pie chart showing disk space utilization.
        *   **Network Activity Chart:** Line chart showing network ingress/egress.
    *   Each chart should have clear labels, tooltips on hover, and interactive elements (e.g., time range selection).
    *   Small cards or badges displaying current key metrics (e.g., current CPU %, current Memory usage).

3.  **Configuration (Below Utilization Metrics):**
    *   Card displaying the resource's configuration details.
    *   Includes:
        *   Configuration details in a readable format (e.g., key-value pairs, collapsible sections for complex configs).
        *   Might include options to view raw configuration (JSON/YAML) with syntax highlighting.
    *   Optionally, a button to edit configuration (if user has `manageResources` permission).

4.  **Activity Logs (Below Configuration):**
    *   Card displaying recent activity logs related to this specific resource.
    *   Table component showing a list of logs.
    *   Table columns: Timestamp, Event Type, User/System, Details, Severity.
    *   Filtering and sorting options for logs.
    *   Clicking on a log entry opens a modal or panel with full log details.
    *   Pagination for large numbers of logs.

**Content Arrangement within Sections:**

*   Use the `Card` component to group related information within each section.
*   Use `Table` components for displaying lists of data (e.g., activity logs).
*   Use Chart components for visualizing utilization metrics.
*   Use `Input`, `Label`, `Select`, and `Button` components within configuration editing forms (if implemented).
*   Use layout components (Grid, Stack) to arrange Cards and other elements within the main content area.

**Integration of Components:**

*   Utilize the defined `Card`, `Button`, `Table`, `Input`, `Label`, Chart, and Feedback components throughout the page.
*   Ensure consistent styling and behavior of these components according to their specifications.
*   Implement conditional rendering or disabling of controls (e.g., scaling buttons, edit configuration button) based on the user's IAM permissions (`viewResources`, `manageResources`) obtained from the `useUser()` hook and checked with `canUserPerform()`.

**Visualization of Resource Utilization Trends and Anomalies:**

*   Highlight critical metrics or anomalies directly on the utilization charts (e.g., color-coded thresholds, visual markers for detected anomalies).
*   Integrate small visual indicators (e.g., sparkline charts, status icons) in the Overview section to provide a quick visual summary of utilization and health.
*   If anomaly detection is implemented for resources, display detected anomalies prominently, potentially with links to related audit logs or recommended actions.

**Controls for Managing Resource:**

*   Dedicated section or card for resource management controls.
*   Buttons for actions like:
    *   Scale Up/Down (CPU, Memory)
    *   Adjust Allocation (Disk, Network)
    *   Restart/Stop/Start Resource
    *   Reallocate Resource (to a different node/cluster)
    *   These buttons should be enabled/disabled based on user permissions (`manageResources`).
    *   Confirmation modals (`Dialog` component) for critical actions.

**Notes for Visual Design and Interactivity:**

*   Implement engaging data visualizations for utilization metrics with subtle real-time updates and smooth transitions.
*   Use color palettes consistently for charts and status indicators, aligning with the strategist-grade design language.
*   Incorporate micro-interactions on hover over charts, tables, and interactive elements to provide clear feedback.
*   Ensure the layout is highly responsive, adapting gracefully to different screen sizes, potentially by stacking or hiding less critical information on smaller screens.
*   Highlight critical metrics or anomalies with prominent visual cues (e.g., pulsing indicators, bold colors).
*   Consider a timeline visualization for activity logs to provide a different perspective on resource history.
*   Ensure the page feels performant and responsive, even with a large volume of log data or rapidly updating metrics.
```