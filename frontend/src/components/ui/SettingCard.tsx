import React from "react";

interface SettingCardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * White rounded card used to group settings rows.
 * Replace all the repetitive bg-white rounded-xl border blocks.
 */
export function SettingCard({ title, children, className = "" }: SettingCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 ${className}`}>
      <div className="p-6">
        {title && <h3 className="font-bold text-[15px] text-gray-800 mb-6">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
