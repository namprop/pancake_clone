import React from "react";

interface SettingPageHeaderProps {
  title: string;
  action?: React.ReactNode;
}

/**
 * Page-level header: big title + optional action button (e.g. "Lưu cài đặt").
 */
export function SettingPageHeader({ title, action }: SettingPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-[22px] font-bold text-slate-800">{title}</h2>
      {action && <div>{action}</div>}
    </div>
  );
}
