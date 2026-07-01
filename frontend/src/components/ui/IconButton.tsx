import React from "react";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  active?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * A standard square icon button.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, active, size = "md", className = "", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-6 w-6 rounded-sm",
      md: "h-8 w-8 rounded",
      lg: "h-10 w-10 rounded-md",
    };

    return (
      <button
        ref={ref}
        className={[
          "flex items-center justify-center transition-colors text-gray-500",
          sizeClasses[size],
          active ? "bg-gray-200 text-gray-800" : "bg-[#f0f2f5] hover:bg-gray-200",
          props.disabled ? "opacity-50 cursor-not-allowed" : "",
          className
        ].filter(Boolean).join(" ")}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
