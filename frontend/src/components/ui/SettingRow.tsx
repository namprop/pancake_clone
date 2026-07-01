import React from "react";

interface SettingRowProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** adds border-t divider above the row */
  divider?: boolean;
}

/**
 * A single settings row: [Icon  Title / Description ............. Control]
 * Used across all settings pages.
 */
export function SettingRow({ icon, title, description, children, divider = false }: SettingRowProps) {
  return (
    <div className={`${divider ? "border-t border-gray-100 pt-6" : ""}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon && <span className="w-5 h-5 text-gray-600 shrink-0">{icon}</span>}
        <span className="font-bold text-[14px] text-gray-800">{title}</span>
      </div>
      {(description || children) && (
        <div className={`flex items-center justify-between gap-4 ${icon ? "pl-8" : ""}`}>
          {description && (
            <p className="text-[13px] text-gray-600 leading-snug pr-4">{description}</p>
          )}
          {children && <div className="shrink-0">{children}</div>}
        </div>
      )}
    </div>
  );
}
