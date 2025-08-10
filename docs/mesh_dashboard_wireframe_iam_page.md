### Page Title and Introduction

**Page Title:** IAM Control Panel

**Introduction:** A brief description of the IAM Control Panel's purpose: centralized management and visualization of mesh identities, roles, permissions, and security posture. Emphasize strategist-grade control and introspection.

### Key Sections

The page will be organized into the following key sections:

1.  **IAM Overview:** Provides a high-level summary of the mesh's IAM landscape.
2.  **Service Accounts:** Lists and manages service accounts within the mesh.
3.  **Roles and Permissions:** Displays defined roles and their associated permissions.
4.  **IAM Audit Trail:** Shows a log of IAM-related activities and changes.

### Content Arrangement within Sections

**Overall Layout:** A main content area with sections potentially organized using tabs, accordions, or distinct card groupings for clarity.

**IAM Overview Section:**

*   **Card (IAM Overview Summary):**
    *   CardHeader: Title "IAM Summary" with an icon (e.g., ShieldCheck).
    *   CardContent:
        *   Key metrics: Total Service Accounts, Total Roles, Active Users (if applicable).
        *   High-level status indicators for IAM health (e.g., based on audit findings).
        *   Link or button to trigger an immediate IAM audit (referencing Button component).
*   **Card (IAM Drift/Anomaly Summary):**
    *   CardHeader: Title "IAM Anomalies & Drift" with an icon (e.g., AlertTriangle).
    *   CardContent:
        *   Summary of detected IAM drift or anomalies (e.g., misaligned permissions, unused keys).
        *   Visual indicators (badges, color coding) for severity (referencing Badge component).
        *   Link or button to view detailed IAM Audit Trail (referencing Button component).

**Service Accounts Section:**

*   **Heading:** "Service Accounts"
*   **Button:** "Create Service Account" (referencing Button component).
*   **Table:**
    *   Columns: Service Account Name, ID, Associated Module/Service, Key Status (Active/Inactive), Last Key Rotation, Role(s), Actions.
    *   Rows: List of service accounts.
    *   Actions Column: Buttons for "View Details," "Rotate Key," "Deactivate Key," "Delete" (referencing Button component, potentially with destructive variant).
*   **Modal/Dialog:** For "View Details," "Rotate Key," etc., displaying relevant information and forms (referencing Dialog, Input, Label, Button components).

**Roles and Permissions Section:**

*   **Heading:** "Roles and Permissions"
*   **Table or List:**
    *   Displays each defined Role (Architect, Analyst, Operator, etc.).
    *   For each role, list or display its associated Permissions (Escalate, Quarantine, viewFinancials, viewResources, manageResources, etc.).
    *   Consider a matrix-like visualization (referencing Table or custom layout with Cards/Badges).
*   **Button:** "Manage Roles/Permissions" (potentially opens a separate view or modal with forms for editing roles and permissions, referencing Button, Input, Label components).

**IAM Audit Trail Section:**

*   **Heading:** "IAM Audit Trail"
*   **Filter Bar:** Options to filter audit logs by date range, user, service account, action type (referencing Input, Select, Button components).
*   **Table or List:**
    *   Columns: Timestamp, User/Service Account, Action, Target Resource, Details, Status (Success/Failure).
    *   Rows: List of audit trail entries.

### Integration of Components

*   **Card:** Used extensively to group related information and provide a consistent visual structure.
*   **Button:** Used for actions (create, view, rotate, delete, trigger audit, manage roles, submit).
*   **Input/Label:** Used in forms within modals or dedicated sections for creating/editing service accounts or managing roles/permissions.
*   **Badge:** Used for status indicators (Key Status), severity of anomalies, or possibly for displaying roles/permissions concisely.
*   **Table:** Used for listing service accounts and audit trail entries.
*   **Dialog/Modal:** Used for displaying detailed information or forms for actions.
*   **Select:** Used in filters (e.g., for filtering audit logs).
*   **Icons:** Used to visually represent sections, actions, and statuses (referencing Lucide React icons or similar).

### Visualization of IAM Drift/Anomalies

*   Within the "IAM Overview" section, use visual indicators (color-coded badges, icons, maybe a simple chart) to represent the number and severity of detected drift or anomalies.
*   In the "Service Accounts" or "Roles and Permissions" sections, highlight specific entries that are flagged as anomalous (e.g., a distinct border, background color, or icon next to the item).
*   Consider a timeline visualization in the "IAM Audit Trail" to show patterns of changes or anomalous activity over time.

### Controls for Managing IAM

*   Clearly labeled buttons for all management actions (Create Service Account, Rotate Key, Deactivate Key, Manage Roles/Permissions, etc.).
*   Confirmation steps for critical actions (e.g., deleting a service account, deactivating a key).
*   Forms with appropriate input fields and validation for creating/editing entities.

### Notes for Visual Design and Interactivity

*   **Modern Aesthetic:** Apply the strategist-grade design language (typography, color palette, spacing) to all components and the overall layout.
*   **Visual Hierarchy:** Use typography, spacing, and visual cues to create a clear hierarchy, guiding the strategist's eye to critical information and actions.
*   **Interactive Tables/Lists:** Implement hover effects on table rows or list items. Consider expandable rows to show more details inline.
*   **Dynamic Updates:** If the IAM audit runs periodically, subtly update status indicators or anomaly counts in real-time with a brief animation.
*   **Form Feedback:** Provide clear visual feedback on form validation (e.g., error states on input fields).
*   **Consistent Iconography:** Use a consistent style of icons throughout the page.
*   **Tooltip Integration:** Ensure tooltips are used effectively for explaining complex fields or actions.
*   **Overall Feel:** The page should feel secure, controlled, and provide immediate clarity on the IAM posture of the mesh. The interaction flow for critical actions should be deliberate and clear.