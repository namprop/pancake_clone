import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "tag"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 uppercase tracking-wide",
        {
          "bg-sky-50 text-sky-500 border border-sky-200": variant === "default",
          "bg-emerald-50 text-emerald-600 border border-emerald-200": variant === "success",
          "bg-amber-50 text-amber-600 border border-amber-200": variant === "warning",
          "bg-red-50 text-red-600 border border-red-200": variant === "destructive",
          "text-slate-700 border border-slate-200": variant === "outline",
          "rounded-full": variant === "tag",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
