"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Clock,
  Layers,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  PhoneOff,
  Star,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import type {
  ConversationCommentFilter,
  ConversationCustomerGroup,
  ConversationMessageFilter,
  ConversationReadStatus,
  ConversationReviewStatus,
} from "@/types";
import type { SafeUser } from "@/types/user";

interface SidebarProps {
  user: SafeUser | null;
  activeShopName: string;
  setActiveShopName: (name: string) => void;
  unreadCountSum: number;
  onToggle: () => void;
}

type MenuId = "read" | "comment" | "message" | "review" | "date" | "group";

const READ_OPTIONS: Array<{ value: ConversationReadStatus; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "unread", label: "Chưa đọc" },
  { value: "read", label: "Đã đọc" },
];

const COMMENT_OPTIONS: Array<{ value: ConversationCommentFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "not_messaged", label: "Chưa gửi tin nhắn riêng" },
  { value: "order_marked", label: "Đã đánh dấu tạo đơn hàng" },
  { value: "livestream", label: "Đến từ livestream" },
  { value: "not_livestream", label: "Không đến từ livestream" },
];

const MESSAGE_OPTIONS: Array<{ value: ConversationMessageFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "handling", label: "Ai đang xử lý" },
  { value: "ai_disabled", label: "AI đã tắt" },
  { value: "ai_forwarded", label: "AI đã chuyển tiếp" },
];

const REVIEW_OPTIONS: Array<{ value: ConversationReviewStatus; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "has_review", label: "Có đánh giá" },
  { value: "no_review", label: "Chưa đánh giá" },
];

const CUSTOMER_GROUP_OPTIONS: Array<{
  value: ConversationCustomerGroup;
  label: string;
}> = [
  { value: "all", label: "Tất cả khách" },
  { value: "new", label: "Khách mới" },
  { value: "old", label: "Khách cũ" },
];

export default function Sidebar({ unreadCountSum }: SidebarProps) {
  const {
    conversationFilters,
    setConversationFilters,
    resetConversationFilters,
  } = useAppContext();
  const [activeMenu, setActiveMenu] = useState<MenuId | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasAnyFilter =
    conversationFilters.readStatus !== "all" ||
    conversationFilters.commentFilter !== "all" ||
    conversationFilters.messageFilter !== "all" ||
    conversationFilters.reviewStatus !== "all" ||
    conversationFilters.assigned !== "all" ||
    conversationFilters.starred ||
    conversationFilters.phone !== "all" ||
    conversationFilters.unreplied ||
    conversationFilters.duplicate ||
    conversationFilters.customerGroup !== "all" ||
    Boolean(conversationFilters.dateFrom || conversationFilters.dateTo);

  const setReadStatus = (value: ConversationReadStatus) => {
    setConversationFilters((current) => ({ ...current, readStatus: value }));
    setActiveMenu(null);
  };

  const setCommentFilter = (value: ConversationCommentFilter) => {
    setConversationFilters((current) => ({
      ...current,
      channels: [],
      commentFilter: value,
      messageFilter: "all",
    }));
    setActiveMenu(null);
  };

  const setMessageFilter = (value: ConversationMessageFilter) => {
    setConversationFilters((current) => ({
      ...current,
      channels: [],
      commentFilter: "all",
      messageFilter: value,
    }));
    setActiveMenu(null);
  };

  const setReviewStatus = (value: ConversationReviewStatus) => {
    setConversationFilters((current) => ({ ...current, reviewStatus: value }));
    setActiveMenu(null);
  };

  const togglePhone = (phone: "has" | "none") => {
    setConversationFilters((current) => ({
      ...current,
      phone: current.phone === phone ? "all" : phone,
    }));
  };

  const toggleUnreplied = () => {
    setConversationFilters((current) => ({
      ...current,
      unreplied: !current.unreplied,
    }));
  };

  const toggleDuplicate = () => {
    setConversationFilters((current) => ({
      ...current,
      duplicate: !current.duplicate,
    }));
  };

  const setDateFilter = (key: "dateFrom" | "dateTo", value: string) => {
    setConversationFilters((current) => ({ ...current, [key]: value }));
  };

  const setCustomerGroup = (value: ConversationCustomerGroup) => {
    setConversationFilters((current) => ({ ...current, customerGroup: value }));
    setActiveMenu(null);
  };

  const renderTooltip = (tooltip: string) =>
    !activeMenu ? (
      <div className="absolute left-[calc(100%+4px)] px-3 py-1.5 bg-[#242526] text-white text-[13px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-md flex items-center before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-[#242526]">
        {tooltip}
      </div>
    ) : null;

  const renderIconButton = (
    id: string,
    Icon: React.ComponentType<{ className?: string }>,
    tooltip: string,
    isActive: boolean,
    onClick: () => void,
    badge?: number
  ) => (
    <div className="relative group w-full flex justify-center mb-2" key={id}>
      <button
        type="button"
        onClick={onClick}
        className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-white/20 text-white shadow-inner"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }`}
        title={tooltip}
      >
        <Icon className="w-[20px] h-[20px]" />
        {badge ? (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[9px] min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center border-2 border-[#1554ad]">
            {badge}
          </div>
        ) : null}
      </button>

      {renderTooltip(tooltip)}
    </div>
  );

  const renderRadioMenu = <T extends string>({
    id,
    title,
    options,
    value,
    onChange,
  }: {
    id: MenuId;
    title: string;
    options: Array<{ value: T; label: string }>;
    value: T;
    onChange: (value: T) => void;
  }) =>
    activeMenu === id ? (
      <div className="absolute left-[calc(100%+8px)] top-0 min-w-[220px] bg-[#242526] text-white rounded-md shadow-[0_12px_28px_rgba(0,0,0,0.22)] py-2 z-50 before:content-[''] before:absolute before:right-full before:top-6 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-[#242526]">
        <div className="px-3 pb-1 text-[13px] font-medium leading-5">{title}</div>
        <div className="flex flex-col pb-1">
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className="flex w-full items-center gap-2 px-3 py-[3px] text-left text-[13px] font-medium leading-5 hover:bg-white/10"
              >
                <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-white">
                  {selected ? <span className="h-2.5 w-2.5 rounded-full bg-[#2d88ff]" /> : null}
                </span>
                <span className="whitespace-nowrap">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    ) : null;

  const renderMenuIcon = <T extends string>(
    id: MenuId,
    Icon: React.ComponentType<{ className?: string }>,
    tooltip: string,
    isActive: boolean,
    menuTitle: string,
    options: Array<{ value: T; label: string }>,
    value: T,
    onChange: (value: T) => void,
    badge?: number
  ) => (
    <div className="relative group w-full flex justify-center mb-2" key={id}>
      <button
        type="button"
        onClick={() => setActiveMenu(activeMenu === id ? null : id)}
        className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-white/20 text-white shadow-inner"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        }`}
        title={tooltip}
      >
        <Icon className="w-[20px] h-[20px]" />
        {badge ? (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[9px] min-w-[15px] h-[15px] px-1 rounded-full flex items-center justify-center border-2 border-[#1554ad]">
            {badge}
          </div>
        ) : null}
      </button>

      {renderTooltip(tooltip)}
      {renderRadioMenu({ id, title: menuTitle, options, value, onChange })}
    </div>
  );

  return (
    <div
      ref={sidebarRef}
      className="w-[52px] bg-[#1554ad] flex flex-col items-center py-4 shrink-0 h-full select-none z-40 overflow-visible"
    >
      <div className="flex flex-col w-full items-center gap-1.5">
        {renderIconButton("all", MessageSquare, "Hiển thị tất cả", !hasAnyFilter, resetConversationFilters)}
        {renderMenuIcon(
          "read",
          UserRoundCheck,
          "Lọc chưa đọc",
          conversationFilters.readStatus !== "all",
          "Lọc chưa đọc",
          READ_OPTIONS,
          conversationFilters.readStatus,
          setReadStatus
        )}
        {renderMenuIcon(
          "comment",
          MessageCircle,
          "Lọc bình luận",
          conversationFilters.commentFilter !== "all",
          "Lọc bình luận",
          COMMENT_OPTIONS,
          conversationFilters.commentFilter,
          setCommentFilter
        )}
        {renderMenuIcon(
          "message",
          Mail,
          "Lọc tin nhắn",
          conversationFilters.messageFilter !== "all",
          "Lọc tin nhắn",
          MESSAGE_OPTIONS,
          conversationFilters.messageFilter,
          setMessageFilter,
          unreadCountSum || undefined
        )}
        {renderMenuIcon(
          "review",
          Star,
          "Lọc đánh giá",
          conversationFilters.reviewStatus !== "all",
          "Lọc đánh giá",
          REVIEW_OPTIONS,
          conversationFilters.reviewStatus,
          setReviewStatus
        )}
        {renderIconButton(
          "phone",
          Phone,
          "Hội thoại có số điện thoại",
          conversationFilters.phone === "has",
          () => togglePhone("has")
        )}
        {renderIconButton(
          "phone-off",
          PhoneOff,
          "Hội thoại không có số điện thoại",
          conversationFilters.phone === "none",
          () => togglePhone("none")
        )}
        {renderIconButton(
          "unreplied",
          Clock,
          "Hội thoại chưa trả lời",
          conversationFilters.unreplied,
          toggleUnreplied
        )}

        <div className="relative group w-full flex justify-center mb-2">
          <button
            type="button"
            onClick={() => setActiveMenu(activeMenu === "date" ? null : "date")}
            className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
              conversationFilters.dateFrom || conversationFilters.dateTo
                ? "bg-white/20 text-white shadow-inner"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
            title="Lọc theo ngày"
          >
            <Calendar className="w-[20px] h-[20px]" />
          </button>

          {renderTooltip("Lọc theo ngày")}

          {activeMenu === "date" && (
            <div className="absolute left-[calc(100%+8px)] top-0 w-64 bg-[#242526] text-white rounded-lg shadow-xl p-3 z-50 before:content-[''] before:absolute before:right-full before:top-4 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-[#242526]">
              <div className="text-[13px] font-semibold mb-2">Lọc theo ngày</div>
              <div className="space-y-2">
                <input
                  type="date"
                  value={conversationFilters.dateFrom}
                  onChange={(event) => setDateFilter("dateFrom", event.target.value)}
                  className="w-full rounded-md bg-white px-2 py-1.5 text-[12px] text-slate-800 outline-none"
                />
                <input
                  type="date"
                  value={conversationFilters.dateTo}
                  onChange={(event) => setDateFilter("dateTo", event.target.value)}
                  className="w-full rounded-md bg-white px-2 py-1.5 text-[12px] text-slate-800 outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setConversationFilters((current) => ({
                      ...current,
                      dateFrom: "",
                      dateTo: "",
                    }))
                  }
                  className="w-full rounded-md bg-white/10 px-2 py-1.5 text-[12px] font-semibold hover:bg-white/15"
                >
                  Xóa lọc ngày
                </button>
              </div>
            </div>
          )}
        </div>

        {renderIconButton("duplicate", Layers, "Hội thoại trùng lặp", conversationFilters.duplicate, toggleDuplicate)}

        {renderMenuIcon(
          "group",
          Users,
          "Lọc nhóm khách",
          conversationFilters.customerGroup !== "all",
          "Lọc nhóm khách",
          CUSTOMER_GROUP_OPTIONS,
          conversationFilters.customerGroup,
          setCustomerGroup
        )}
      </div>
    </div>
  );
}
