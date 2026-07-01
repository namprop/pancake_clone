"use client";

import React from "react";
import { Switch as AntSwitch } from "antd";

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Switch wrapper around antd Switch.
 * Keeps same API as the old custom Switch so all pages work without changes.
 */
const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, className }, ref) => {
    return (
      <AntSwitch
        checked={checked}
        onChange={(val) => onCheckedChange?.(val)}
        disabled={disabled}
        className={className}
        style={checked ? { backgroundColor: "#1554ad" } : undefined}
      />
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
