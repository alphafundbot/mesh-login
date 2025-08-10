import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  // TODO: Align badge colors, shape, size, and specific hover/focus effects
  // with the strategist-grade design language defined in docs/design_language.md
  {
    variants: {
      variant: {
        // TODO: Map to specific primary color from design_language.md
        default:
 "border-transparent bg-primary text-primary-foreground hover:bg-primary/90", // Slightly darker hover
        // TODO: Map to specific secondary color from design_language.md
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // TODO: Map to specific destructive color from design_language.md
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        // TODO: Refine border and text color for outline variant based on design_language.md
        outline: "text-foreground border-foreground/50", // Example refinement
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
