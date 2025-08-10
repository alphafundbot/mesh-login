# MeshDashboard Component Specification: Button

## Purpose and Usage

The Button component is a fundamental interactive element used throughout the MeshDashboard to trigger actions, navigate to different sections, and indicate interactive elements. It should provide clear visual feedback to the user and be easily distinguishable based on its intended action and priority.

## Variants

Button variants should align with the strategist-grade color palette and convey the semantic meaning of the action.

- **Default:** Standard button for general actions.
  - Background: Primary color
  - Text: Primary foreground color
  - Hover: Slightly darker primary background
  - Focus: Outline with ring color, offset
- **Primary:** Highlights the most important action on a screen.
  - Background: Accent color
  - Text: Accent foreground color
  - Hover: Slightly darker accent background
  - Focus: Outline with ring color, offset
- **Secondary:** For less emphasized actions, often paired with a primary button.
  - Background: Secondary color
  - Text: Secondary foreground color
  - Hover: Slightly darker secondary background
  - Focus: Outline with ring color, offset
- **Destructive:** Indicates a potentially dangerous or irreversible action (e.g., delete, remove).
  - Background: Destructive color
  - Text: Destructive foreground color
  - Hover: Slightly darker destructive background
  - Focus: Outline with ring color, offset
- **Outline:** Button with a border and transparent or light background, for secondary or tertiary actions.
  - Background: Transparent or subtle background color
  - Border: Border color
  - Text: Foreground color
  - Hover: Subtle background change and border color highlight
  - Focus: Outline with ring color, offset
- **Ghost:** Minimal styling, often used for less prominent actions within a component.
  - Background: Transparent
  - Text: Foreground color
  - Hover: Subtle background highlight
  - Focus: Outline with ring color, offset
- **Link:** Styled as a text link, for navigating within the application or to external resources.
  - Background: Transparent
  - Text: Primary color
  - Underline: Underline on hover
  - Focus: Outline with ring color, offset

## Sizes

Button sizes should accommodate different contexts and levels of prominence.

- **Small (sm):** Compact size for use in dense UIs or lists.
- **Medium (default):** Standard size for general use.
- **Large (lg):** Larger size for primary calls to action.
- **Icon:** Square size for buttons containing only an icon.

## States

Buttons should provide clear visual feedback for different states.

- **Default:** Standard appearance based on variant and size.
- **Hover:** Visual change when the user's cursor is over the button (e.g., background change, shadow, border highlight).
- **Focus:** Visual indicator when the button is focused (e.g., keyboard navigation), typically an outline ring.
- **Active:** Visual change when the button is being pressed or is the active element in a toggle group.
- **Disabled:** Button is non-interactive and visually muted (reduced opacity, desaturated colors).
- **Loading:** Indicates that an action is in progress, often with a spinner icon and disabled state.

## Iconography Integration

Buttons should support the inclusion of icons, positioned to the left or right of the text label. Icons should be consistently sized within the button and align visually with the text. The component should handle spacing between the icon and text automatically.

## Responsiveness

Button sizes and spacing should adapt appropriately to different screen sizes, ensuring usability on mobile devices. Font sizes may also need adjustments for smaller screens.

## Accessibility

- Ensure sufficient color contrast between button text and background in all states.
- Provide clear focus indicators for keyboard navigation.
- Use semantic HTML button elements.
- Provide ARIA attributes where necessary for custom button implementations.
- Ensure buttons are keyboard interactive.

## Notes for Visual Engagement

- **Micro-interactions:** Consider subtle animations on hover (e.g., slight scale, subtle glow) or click (e.g., ripple effect, subtle bounce) to enhance perceived responsiveness and engagement.
- **Loading State Animation:** Use a smooth and visually appealing spinner animation for the loading state.
- **Icon Animations:** Explore subtle animations for icons within buttons, especially during loading or on hover.
