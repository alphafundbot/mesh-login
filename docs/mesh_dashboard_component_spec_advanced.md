# Mesh Dashboard Component Specification: Advanced Components (Modals, Popovers, Tooltips)

## 1. Purpose and Usage

This document specifies the design and behavior for advanced UI components used to display supplementary information or enable interactions without requiring a full page navigation.

- **Modals:** Used for critical information, user confirmation, or complex forms that require user focus and prevent interaction with the main content until dismissed.
- **Popovers:** Used to display rich, interactive content or controls in a small overlay anchored to a trigger element. Ideal for filters, settings, or contextual information.
- **Tooltips:** Used to provide brief, informative labels or descriptions for interactive elements on hover or focus.

## 2. Visual Appearance

The visual appearance of advanced components should align with the overall strategist-grade design language, emphasizing clarity, focus, and minimal distraction from the main mesh data.

- **Overlays (for Modals):** A semi-transparent, darkened overlay should cover the background content to ensure focus on the modal. The overlay color and opacity should be consistent with the defined neutral or background colors in the design language.
- **Positioning:**
    - **Modals:** Centered vertically and horizontally within the viewport, with a maximum width on larger screens and full width/height on smaller screens.
    - **Popovers:** Positioned intelligently relative to the trigger element, appearing above, below, left, or right as needed to stay within the viewport and avoid obscuring important content.
    - **Tooltips:** Positioned near the trigger element, typically above or below, with a small offset.
- **Content Styling:**
    - **Modals/Popovers:** Content areas (Headers, Bodies, Footers) should use typography, spacing, and colors consistent with the design language. Use Card-like styling for the container (rounded corners, subtle border/shadow).
    - **Tooltips:** Simple, clean text with a background and minimal padding. Typography should be small and legible.
- **Borders and Shadows:** Modals and Popovers should have a defined border and a distinct shadow to visually separate them from the background content.
- **Backgrounds:** Use defined background colors for the component containers, ensuring sufficient contrast with the text.

## 3. States

- **Open/Closed:** Components transition smoothly between open and closed states.
- **Loading (within Modals/Popovers):** If content is loading asynchronously within a modal or popover, display a loader consistent with the specified Loader component.
- **Error (within Modals/Popovers):** Display error messages or indicators within the component content using the specified feedback and typography styles.

## 4. Responsiveness

Advanced components must be responsive and usable across various screen sizes.

- **Modals:** On smaller screens, modals should typically transition to a full-screen overlay or a sheet-like presentation to maximize content area.
- **Popovers:** Positioning logic should ensure popovers remain within the viewport on smaller screens, potentially adjusting their anchor point or flipping direction.
- **Tooltips:** Tooltips should remain visible and not be cut off by the viewport edges. On touch devices, alternative methods for accessing tooltip information might be needed (e.g., long press, dedicated info icon).

## 5. Accessibility

Adhere to WCAG guidelines for accessibility.

- **Keyboard Navigation:** Ensure all interactive elements within advanced components are keyboard navigable and focusable.
- **ARIA Attributes:** Use appropriate ARIA attributes to convey the component's role, state, and properties to assistive technologies.
- **Focus Management:** When a modal or dialog opens, focus should be trapped within the component. When closed, focus should return to the triggering element.
- **Color Contrast:** Ensure sufficient color contrast for text and interactive elements.
- **Screen Reader Support:** Content should be accessible and understandable to screen readers.

## 6. Interaction

- **Triggering:** Modals and Popovers are typically triggered by user interaction (e.g., clicking a button, hovering over an element). Tooltips are triggered on hover or keyboard focus.
- **Dismissing:**
    - **Modals:** Dismissed by clicking a close button, pressing the Escape key, or clicking the overlay (depending on context and criticality).
    - **Popovers:** Dismissed by clicking outside the popover, pressing the Escape key, or clicking the trigger element again.
    - **Tooltips:** Dismissed when the user moves the pointer away from or removes keyboard focus from the trigger element.

## 7. Notes for Visual Engagement

- **Subtle Animations:** Incorporate subtle fade or scale-in animations when components appear and fade or scale-out animations when they are dismissed.
- **Clear Visual Hierarchy:** Within Modals and Popovers, use typography, spacing, and visual separators to create a clear hierarchy of information.
- **Highlighting Key Information:** Use color, typography, or icons to highlight critical information within the component content.
- **Validation Feedback (Forms in Modals/Popovers):** Clearly indicate validation errors using visual cues (e.g., red borders, error messages) next to the relevant form fields.