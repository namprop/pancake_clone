"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Settings, 
  Tag, 
  Sparkles, 
  MessageSquare, 
  Monitor, 
  Phone, 
  RefreshCw, 
  Cloud, 
  Wrench, 
  Users, 
  History
} from "lucide-react";

const MENU_ITEMS = [
  { id: "general", label: "Cài đặt chung", icon: Settings },
  { id: "tags", label: "Thẻ hội thoại", icon: Tag },
  { id: "ai", label: "Trợ lý AI", badge: "Beta", icon: Sparkles },
  { id: "auto_reply", label: "Hỗ trợ trả lời", icon: MessageSquare },
  { id: "interface", label: "Giao diện", icon: Monitor },
  { id: "calls", label: "Cuộc gọi", icon: Phone },
  { id: "rotation", label: "Chế độ xoay vòng", icon: RefreshCw },
  { id: "sync", label: "Đồng bộ", icon: Cloud },
  { id: "tools", label: "Công cụ", icon: Wrench },
  { id: "roles", label: "Phân quyền", icon: Users },
  { id: "history", label: "Lịch sử", icon: History },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex w-full h-full font-sans text-slate-800">
      {/* Left Sidebar */}
      <div className="w-[260px] bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
        <div className="p-6 pb-4">
          <h1 className="text-xl font-bold">Cài đặt</h1>
        </div>
        
        <div className="flex flex-col px-4 gap-1 pb-6">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const href = `/settings/${item.id}`;
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={item.id}
                href={href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition text-sm font-medium ${
                  isActive 
                    ? "bg-[#e6f2ff] text-blue-600" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.5 : 2} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="bg-[#fcf1c5] text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-[#f0f2f5] overflow-y-auto relative">
        {children}
      </div>
    </div>
  );
}

