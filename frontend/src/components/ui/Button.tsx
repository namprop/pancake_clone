import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "tab" | "danger"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-bold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-md hover:scale-[1.01] active:scale-[0.99]": variant === "default",
            "bg-white border border-sky-200 text-slate-500 hover:bg-sky-50": variant === "outline",
            "bg-transparent text-slate-400 hover:text-sky-500 hover:bg-sky-50": variant === "ghost",
            "border-b-2 rounded-none hover:text-sky-500 hover:bg-sky-50": variant === "tab",
            "bg-white text-slate-500 hover:text-red-400": variant === "danger",
            "px-4 py-2": size === "default",
            "px-2.5 py-1.5": size === "sm",
            "px-4 py-3.5": size === "lg",
            "h-10 w-10 p-2.5": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
