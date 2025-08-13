import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles: Ensure these align with the strategist-grade design language (docs/design_language.md)
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  { // Refine variants based on specs in docs/mesh_dashboard_component_spec_button.md and design language in docs/design_language.md
    variants: {
      variant: {
        // Default variant: Refine colors and hover effects based on design language
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md transition-shadow", // Enhanced hover effect with slightly darker primary and shadow
        // Destructive variant: Ensure colors align with semantic danger color in design language
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md transition-shadow", // Added subtle shadow on hover
        // Outline variant: Refine border and background on hover based on design language
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent/10 hover:text-accent-foreground transition-colors", // Refined hover with subtle background tint
        // Secondary variant: Ensure colors align with secondary color in design language
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md transition-shadow", // Added subtle shadow on hover
        // Ghost variant: Refine hover effects based on design language
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // Link variant: Ensure colors align with primary/link color in design language
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      // Define new size variants if needed, aligning with spacing scale in design language
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
export { Button, buttonVariants }

