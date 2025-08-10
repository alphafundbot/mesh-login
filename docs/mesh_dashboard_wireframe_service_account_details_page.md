# Wireframe: Service Account Details Page

## Page Title
Service Account: [Service Account Name/ID]

## Overall Layout
- Standard AppLayout with main content area.
- Breadcrumbs at the top: Dashboard > IAM > Service Accounts > [Service Account Name/ID]

## Key Sections

### 1. Overview/Summary
- **Purpose:** Provide a high-level summary of the service account.
- **Content:**
    - Service Account Name/ID (large text)
    - Email Address
    - Project ID
    - Creation Date
    - Last Active Date (if tracked)
    - Status (Active/Inactive - with a visual indicator)
    - Brief Description/Purpose
- **Components:** Card, Text elements, Badge

### 2. Role Bindings
- **Purpose:** Display the roles assigned to this service account.
- **Content:**
    - Table listing roles and the resource/level they apply to (e.g., Project, Folder, Specific Resource).
    - Columns: Role Name, Resource/Scope, Source (e.g., IAM Policy, Service Account Key).
    - Option to filter or sort roles.
- **Components:** Card, Table, Filter/Search Input

### 3. Key Management
- **Purpose:** Manage API keys or other credentials associated with the service account.
- **Content:**
    - List of active keys (truncated or masked).
    - Creation date, last used date.
    - Buttons for:
        - Create New Key
        - Rotate Key
        - Deactivate/Delete Key
    - **Security Note:** Displaying full keys should require explicit user action and potentially re-authentication. Key creation/download process needs careful design.
- **Components:** Card, List or Table, Buttons, potentially a Dialog for key creation/display.

### 4. Activity Logs (Filtered for this Service Account)
- **Purpose:** Show recent actions performed by this service account.
- **Content:**
    - Table listing activity logs filtered by service account.
    - Columns: Timestamp, Action, Resource Affected, Status, Source IP (if available).
    - Filtering and sorting options.
    - Link to full Audit Trail page filtered by this service account.
- **Components:** Card, Table, Filter/Search Input, Link

## Content Arrangement within Sections
- Sections organized vertically within the main content area.
- Cards used to visually group related information within each section.
- Tables used for displaying lists of roles, keys, and activity logs.
- Buttons strategically placed for key management and linking to related pages.

## Integration of Components
- Use Card components for each main section (Overview, Role Bindings, Key Management, Activity Logs).
- Use Table components within Role Bindings and Activity Logs.
- Use Button components for actions (Create Key, Rotate Key, etc.).
- Use Input and Label components if forms are needed for editing service account details or filtering.
- Integrate Badge for status indicators.
- Utilize Navigation components (Breadcrumbs) at the top.

## Visualization of Service Account Activity or Anomalies
- Consider a small chart or visual indicator in the Overview section showing recent activity volume or a simple health status.
- Highlight anomalous activity logs in the Activity Logs table with color coding or icons.
- Potentially visualize key usage patterns over time.

## Controls for Managing Service Account
- Buttons for key management within the Key Management section.
- Potentially buttons for editing service account details or role bindings (might link to separate forms or dialogs for complex operations).
- Button to link to the full Audit Trail filtered by this service account.

## Notes for Visual Design and Interactivity
- Apply the strategist-grade design language consistently (typography, colors, spacing, component styles).
- Use clear visual hierarchy to distinguish sections and key information.
- Implement subtle hover effects on table rows and buttons.
- Design a secure and clear workflow for key creation and display.
- Consider micro-interactions for button clicks (loading states) and data updates in tables.
- Ensure tables are responsive and usable on different screen sizes.
- Visually differentiate critical information (e.g., key details, anomalous activity).