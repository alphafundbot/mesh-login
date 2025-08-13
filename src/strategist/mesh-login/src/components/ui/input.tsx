import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn( // Refined styling based on docs/mesh_dashboard_component_spec_input_label.md and docs/design_language.md
          "flex h-10 w-full rounded-md border border-alpha-border bg-alpha-background px-3 py-2 text-base text-alpha-foreground ring-offset-alpha-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-alpha-foreground placeholder:text-alpha-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-alpha-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[error=true]:border-alpha-destructive md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
