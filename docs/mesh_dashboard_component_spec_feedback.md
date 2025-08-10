# Mesh Dashboard Component Specification: Feedback Components

## Purpose and Usage

Feedback components (Toasts, Dialogs, Loaders) are used to communicate the status of user actions, system processes, and important events. They provide timely and relevant information to the user, guiding their interaction and indicating system state.

-   **Toasts:** Non-intrusive, temporary messages providing brief feedback (e.g., success confirmations, minor warnings).
-   **Dialogs:** Modal windows requiring user interaction or attention for critical information, confirmations, or complex inputs.
-   **Loaders:** Indicate that a process is ongoing and the system is working, preventing user uncertainty.

## Visual Appearance

The visual appearance of feedback components should align with the strategist-grade design language, ensuring consistency and clarity.

### Toasts

-   **Shape:** Rounded corners, subtle shadow.
-   **Colors:**
    -   **Background:** Use semantic colors from the palette (e.g., `bg-success`, `bg-warning`, `bg-destructive`, `bg-info`) with appropriate opacity to allow background content to be partially visible (e.g., 80-90% opacity).
    -   **Text:** Use contrasting text colors (e.g., `text-success-foreground`, `text-destructive-foreground`).
    -   **Icon:** Semantic color matching the background.
-   **Typography:** Small, readable font size (e.g., `text-sm`).
-   **Icons:** Include relevant icons (e.g., checkmark for success, warning triangle, error icon) to quickly convey the type of feedback.
-   **Positioning:** Typically appear in a consistent location (e.g., top-right, bottom-center) and stack neatly if multiple toasts appear.

### Dialogs

-   **Shape:** Rounded corners, prominent shadow.
-   **Colors:**
    -   **Overlay:** Semi-transparent dark overlay to dim the background content, focusing attention on the dialog.
    -   **Background:** Use the primary card background color (`bg-card`).
    -   **Text:** Use primary foreground and muted foreground colors for titles, descriptions, and content.
    -   **Borders:** Subtle border color (`border`).
-   **Typography:** Larger font size for titles (e.g., `text-lg` or `text-xl`), standard text size for descriptions and content.
-   **Structure:** Clear separation of Header (Title, Description), Content, and Footer (Action Buttons).
-   **Action Buttons:** Use Button components with appropriate variants (e.g., `default`, `destructive`, `outline`) for primary and secondary actions.

### Loaders

-   **Types:**
    -   **Spinner/Indicator:** For indeterminate loading (e.g., fetching data). Subtle animation (e.g., rotating).
    -   **Progress Bar:** For processes with a known duration or progress (e.g., file upload, batch processing).
-   **Colors:** Use accent color (`text-accent`, `bg-accent`) or primary color (`text-primary`, `bg-primary`) for the loader animation or progress bar.
-   **Size:** Varying sizes depending on context (inline, within a component, full-page overlay).
-   **Appearance:** Should be visually distinct but not overly distracting.

## States

Feedback components have different states that determine their appearance and behavior.

### Toasts

-   **Appearance:** Slide or fade in subtly.
-   **Dismissal:** Automatically dismiss after a set duration or can be manually dismissed by clicking a close button (if applicable).

### Dialogs

-   **Appearance:** Fade in and scale slightly from the center of the screen.
-   **Dismissal:** Dismissed by clicking an action button, clicking outside the dialog (unless a critical action is required), or pressing the Escape key.

### Loaders

-   **Indeterminate:** Continuous animation (e.g., spinner rotating).
-   **Progress:** Progress bar fills up based on the completion percentage.

## Responsiveness

Feedback components should be responsive to different screen sizes.

-   **Toasts:** Adjust positioning and stacking behavior on smaller screens.
-   **Dialogs:** Ensure the modal remains centered and usable on smaller screens. Content should scroll if it exceeds the viewport height.
-   **Loaders:** Adjust size and positioning as needed.

## Accessibility

Accessibility considerations are crucial for feedback components.

-   **Toasts:** Should be announced by screen readers using ARIA live regions. Ensure sufficient color contrast for text and icons.
-   **Dialogs:** Should trap focus within the dialog when open. Keyboard navigation should be supported (e.g., tabbing between interactive elements). Screen readers should announce the dialog content when it opens. Ensure sufficient color contrast.
-   **Loaders:** For indeterminate loaders, provide alternative text for screen readers (e.g., "Loading..."). For progress bars, ensure the current value is conveyed to screen readers.

## Notes for Visual Engagement

While primarily functional, feedback components can incorporate subtle visual engagement to enhance the user experience.

-   **Toasts:** Subtle animations on appearance and dismissal (e.g., a quick slide and fade). A small, satisfying sound cue (optional and configurable).
-   **Dialogs:** Smooth transitions when appearing and dismissing. Highlight the primary action button visually.
-   **Loaders:** Visually appealing animations that convey progress or activity without being jarring. For progress bars, a subtle animation as the bar fills.