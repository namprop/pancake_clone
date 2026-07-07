"use client";

import React, { useEffect } from "react";
import { Customer, Platform, Tag } from "@/types";
import { Search, AlertCircle, Filter, RefreshCw } from "lucide-react";
import { TAGS } from "@/data/mockData";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useChatList } from "@/hooks/useChatList";

interface ChatListProps {
  customers: Customer[];
  selectedCustomerId: string;
  onSelectCustomer: (id: string) => void;
  tags: Tag[];
  forcedSearchQuery?: string;
}

export default function ChatList({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  tags,
  forcedSearchQuery = "",
}: ChatListProps) {
  const {
    searchQuery,
    setSearchQuery,
    platformFilter,
    setPlatformFilter,
    statusFilter,
    setStatusFilter,
    activeTagFilters,
    setActiveTagFilters,
    filteredCustomers,
    triggerSync,
    facebookSyncState,
    setAutoSyncEnabled,
    workspaceSettings,
  } = useChatList(customers, tags);

  useEffect(() => {
    setSearchQuery(forcedSearchQuery);
  }, [forcedSearchQuery, setSearchQuery]);

  const renderPlatformBadge = (platform: Platform) => {
    switch (platform) {
      case Platform.FACEBOOK:
        return <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shadow-sm" title="Facebook">f</span>;
      case Platform.INSTAGRAM:
        return <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-black shadow-sm" title="Instagram">📸</span>;
      case Platform.SHOPEE:
        return <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-black flex items-center justify-center text-[10px] shadow-sm animate-pulse" title="Shopee">S</span>;
      case Platform.TIKTOK:
        return <span className="w-5 h-5 rounded-full bg-slate-900 text-cyan-400 font-extrabold flex items-center justify-center text-[9px] border border-red-400/50 shadow-sm" title="TikTok">T</span>;
      case Platform.WHATSAPP:
        return <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[11px] shadow-sm" title="WhatsApp">W</span>;
    }
  };

  const formatTime = (date: Date) => {
    try {
      return new Date(date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  };

  const formatTimestamp = (dateInput: Date | string) => {
    if (!dateInput) return "";
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return "";

      const now = new Date();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      if (date.toDateString() === now.toDateString()) {
        return `${hours}:${minutes}`;
      }

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `${hours}:${minutes} hôm qua`;
      }

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    } catch {
      return "";
    }
  };
  const formatSyncTime = (dateInput: string) => {
    if (!dateInput) return "";
    try {
      return new Date(dateInput).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const syncStatusText = facebookSyncState.isSyncing
    ? "Đang đồng bộ..."
    : facebookSyncState.lastSyncError
      ? "Lỗi đồng bộ"
      : facebookSyncState.lastSyncedAt
        ? `Lần cuối ${formatSyncTime(facebookSyncState.lastSyncedAt)}`
        : "Chưa đồng bộ";

  return (
    <div className="w-full md:w-[320px] lg:w-[360px] bg-white border-r border-gray-200 flex flex-col h-full shrink-0 select-none shadow-sm z-10">
      {/* Search Header */}
      <div className="p-3 flex flex-col gap-2 bg-white shrink-0">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Input
              type="text"
              className="pl-9 bg-[#f0f2f5] border-transparent hover:border-transparent focus:border-transparent focus:ring-0 rounded-md h-[34px] text-[13px] text-slate-700 placeholder-slate-500 shadow-none font-medium"
              placeholder="Tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-500" strokeWidth={1.5} />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-semibold">×</button>
            )}
          </div>
          <button className="flex items-center gap-2 px-3.5 h-[34px] bg-[#f0f2f5] hover:bg-[#e4e6eb] border-transparent rounded-md text-[13px] font-medium text-slate-500 transition shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="10" y1="18" x2="14" y2="18" /></svg>
            Lọc theo
          </button>
          <button
            onClick={() => void triggerSync()}
            disabled={facebookSyncState.isSyncing}
            className="flex items-center justify-center w-[34px] h-[34px] bg-sky-50 hover:bg-sky-100 border border-sky-100 rounded-md text-sky-600 transition shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
            title="Đồng bộ cuộc hội thoại từ Facebook"
          >
            <RefreshCw
              className={`w-[15px] h-[15px] ${facebookSyncState.isSyncing ? "animate-spin" : ""}`}
              strokeWidth={1.8}
            />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setAutoSyncEnabled(!facebookSyncState.autoSyncEnabled)}
            className={`h-[26px] px-2.5 rounded-md text-[12px] font-medium transition flex items-center gap-2 ${
              facebookSyncState.autoSyncEnabled
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-[#f0f2f5] text-slate-600 hover:bg-[#e4e6eb]"
            }`}
            title="Auto sync Facebook every 10 seconds"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                facebookSyncState.autoSyncEnabled ? "bg-emerald-300" : "bg-slate-400"
              }`}
            />
            Tự đồng bộ
          </button>
          <span
            className={`min-w-0 truncate text-[11px] ${
              facebookSyncState.lastSyncError ? "text-red-500" : "text-slate-400"
            }`}
            title={facebookSyncState.lastSyncError || syncStatusText}
          >
            {syncStatusText}
          </span>
        </div>
      </div>

      {/* Tag filter strip (Image 2 mapping) */}
      <div className="flex w-full overflow-x-auto no-scrollbar shrink-0 bg-[#bdc3c7]">
        {tags.map((tag: any) => {
          const tagId = tag._id || tag.id;
          const isSelected = activeTagFilters.includes(tagId);

          let bgColor = "#3b82f6";
          if (tag.color) {
            if (tag.color.startsWith("#")) bgColor = tag.color;
            else if (tag.color.includes("emerald")) bgColor = "#10b981";
            else if (tag.color.includes("pink")) bgColor = "#ec4899";
            else if (tag.color.includes("amber")) bgColor = "#f59e0b";
            else if (tag.color.includes("purple")) bgColor = "#a855f7";
            else if (tag.color.includes("rose")) bgColor = "#f43f5e";
          }

          return (
            <button
              key={tagId}
              onClick={() => setActiveTagFilters(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId])}
              className="relative px-3 py-1.5 text-[11px] font-bold transition-all duration-200 whitespace-nowrap border-r border-black/5 flex-1 flex items-center justify-center text-white"
              style={{ backgroundColor: bgColor }}
            >
              {isSelected && (
                <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-white shrink-0 shadow-sm" />
              )}
              {tag.name}
            </button>
          );
        })}
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-gray-100 bg-white">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-sky-200" />
            <p className="text-xs">Không tìm thấy hội thoại phù hợp</p>
            <p className="text-[10px] text-slate-300">Thử chỉnh lọc hoặc gõ điều kiện khác</p>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const isSelected = cust.id === selectedCustomerId;

            return (
              <div
                key={cust.id}
                onClick={() => onSelectCustomer(cust.id)}
                className={`p-3 flex gap-3 cursor-pointer transition-all duration-150 relative ${isSelected ? "bg-[#dcedfe]" : "bg-white hover:bg-[#f0f2f5]"
                  }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0 select-none">
                  <img
                    src={cust.avatar}
                    alt={cust.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cust.name)}&background=3b5998&color=fff`;
                    }}
                  />
                  {workspaceSettings?.interfaceSettings?.showMainAssignee && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center border border-white text-[9px] font-bold text-emerald-600 shadow-sm z-10" title="Phân công chính">
                      B
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="text-[13px] font-medium truncate text-slate-700 flex items-center gap-1.5">
                      <span className="truncate">{cust.name}</span>
                      {workspaceSettings?.interfaceSettings?.showPageInfo && cust.platform === Platform.FACEBOOK && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-normal shrink-0">
                          Đến từ: {cust.pageName || "Facebook Page"}
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-500 shrink-0 whitespace-nowrap mt-0.5">
                      {formatTimestamp(cust.timestamp)}
                    </span>
                  </div>

                  <div className="flex flex-col mt-0.5">
                    <div className="flex justify-between items-end gap-2">
                      <p className={`text-[12px] truncate flex items-center gap-1 ${cust.unreadCount > 0 ? "text-slate-700 font-bold" : "text-slate-500"}`}>
                        {cust.id === "1" && (
                          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 scale-x-[-1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        )}
                        <span className="truncate">{cust.lastMessage}</span>
                      </p>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {!workspaceSettings?.tagSettings?.showFullName && cust.tags && cust.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            {cust.tags.map((tagId: string) => {
                              const tagDef = tags.find((t: any) => (t._id || t.id) === tagId);
                              if (!tagDef) return null;
                              let bgColor = "#3b82f6";
                              if (tagDef.color) {
                                if (tagDef.color.startsWith("#")) bgColor = tagDef.color;
                                else if (tagDef.color.includes("emerald")) bgColor = "#10b981";
                                else if (tagDef.color.includes("pink")) bgColor = "#ec4899";
                                else if (tagDef.color.includes("amber")) bgColor = "#f59e0b";
                                else if (tagDef.color.includes("purple")) bgColor = "#a855f7";
                                else if (tagDef.color.includes("rose")) bgColor = "#f43f5e";
                              }
                              return (
                                <div key={tagId} className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: bgColor }} title={tagDef.name} />
                              );
                            })}
                          </div>

                        )}
                        <svg className={`w-4 h-4 shrink-0 ${cust.unreadCount > 0 ? "text-orange-500" : "text-slate-400"}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                    </div>
                    {/* Tag Pills */}
                    {workspaceSettings?.tagSettings?.showFullName && cust.tags && cust.tags.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {cust.tags.map((tagId: string) => {
                          const tagDef = tags.find((t: any) => (t._id || t.id) === tagId);
                          if (!tagDef) return null;
                          const isHexColor = tagDef.color && tagDef.color.startsWith("#");
                          if (isHexColor) {
                            return (
                              <span key={tagId} className="px-1.5 py-[2px] rounded-sm text-[10px] font-medium text-white shadow-sm" style={{ backgroundColor: tagDef.color }}>
                                {tagDef.name}
                              </span>
                            );
                          }
                          return (
                            <span key={tagId} className={`px-1.5 py-[2px] rounded-sm text-[10px] shadow-sm ${tagDef.color}`}>
                              {tagDef.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {cust.unreadCount > 0 && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-red-500 text-white font-bold text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center border border-white shrink-0">
                    {cust.unreadCount}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
