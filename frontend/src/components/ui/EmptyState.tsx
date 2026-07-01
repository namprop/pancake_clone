"use client";

import React from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  description?: string;
  icon?: React.ReactNode;
}

/**
 * Empty state shown inside tables when there is no data.
 */
export function EmptyState({ description = "Trống", icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
      {icon ?? <Inbox strokeWidth={1} className="w-12 h-12 mb-3 text-gray-300" />}
      <p className="text-[14px] font-medium text-gray-400">{description}</p>
    </div>
  );
}
