import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full h-10 px-3 py-2 text-sm border rounded-md bg-[#1c1d20] text-[#f5f5f7] border-[#f5f5f7]/10 focus:border-[#f5f5f7]/20 focus:outline-none placeholder:text-[#f5f5f7]/30",
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
