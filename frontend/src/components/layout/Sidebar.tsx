"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  MessageCircle,
  Mail,
  Star,
  Phone,
  PhoneOff,
  Clock,
  Calendar,
  Layers,
  Users,
  User,
} from "lucide-react";
import type { SafeUser } from "@/types/user";

interface SidebarProps {
  user: SafeUser | null;
  activeShopName: string;
  setActiveShopName: (name: string) => void;
  unreadCountSum: number;
  onToggle: () => void;
}

const FILTER_MENUS = {
  unread: {
    title: "Lọc chưa đọc",
    options: ["Tất cả", "Chưa đọc", "Đã đọc"],
  },
  comments: {
    title: "Lọc bình luận",
    options: [
      "Tất cả",
      "Chưa gửi tin nhắn riêng",
      "Đã đánh dấu tạo đơn hàng",
      "Đến từ livestream",
      "Không đến từ livestream",
    ],
  },
  messages: {
    title: "Lọc tin nhắn",
    options: ["Tất cả", "Ai đang xử lý", "Ai đã tắt", "Ai đã chuyển tiếp"],
  },
  reviews: {
    title: "Lọc đánh giá",
    options: ["Tất cả", "Có đánh giá", "Chưa đánh giá"],
  },
};

export default function Sidebar({
  user,
  unreadCountSum,
}: SidebarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({
    unread: "Tất cả",
    comments: "Tất cả",
    messages: "Tất cả",
    reviews: "Tất cả",
  });

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

  const toggleMenu = (menuId: string) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const handleSelectFilter = (menuId: string, option: string) => {
    setSelectedFilters({ ...selectedFilters, [menuId]: option });
    setActiveMenu(null);
  };

  const renderIcon = (
    id: string,
    Icon: any,
    tooltip: string,
    menuData?: { title: string; options: string[] }
  ) => {
    const isActive = activeMenu === id || (selectedFilters[id] && selectedFilters[id] !== "Tất cả");

    return (
      <div className="relative group w-full flex justify-center mb-2" key={id}>
        <button
          onClick={() => menuData ? toggleMenu(id) : null}
          className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
            isActive
              ? "bg-white/20 text-white shadow-inner"
              : "text-white/80 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icon className="w-[20px] h-[20px] fill-current" />
          {id === "unread" && (
            <div className="absolute bottom-2 right-2 w-[7px] h-[7px] bg-white rounded-full border-[1.5px] border-[#1554ad]" />
          )}
          {id === "messages" && unreadCountSum > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[9px] w-[15px] h-[15px] rounded-full flex items-center justify-center border-2 border-[#1554ad]">
              {unreadCountSum}
            </div>
          )}
        </button>

        {/* Tooltip */}
        {!activeMenu && (
          <div className="absolute left-[calc(100%+4px)] px-3 py-1.5 bg-[#242526] text-white text-[13px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-md flex items-center before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-[#242526]">
            {tooltip}
          </div>
        )}

        {/* Dropdown Menu */}
        {activeMenu === id && menuData && (
          <div className="absolute left-[calc(100%+8px)] top-0 w-64 bg-[#242526] text-white rounded-lg shadow-xl py-2 z-50 before:content-[''] before:absolute before:right-full before:top-4 before:-translate-y-1/2 before:border-[6px] before:border-transparent before:border-r-[#242526]">
            <div className="px-3 pb-2 pt-1 font-semibold text-[14px] border-b border-gray-700/50">
              {menuData.title}
            </div>
            <div className="flex flex-col mt-2">
              {menuData.options.map((opt) => (
                <label
                  key={opt}
                  onClick={() => handleSelectFilter(id, opt)}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center ${selectedFilters[id] === opt ? 'border-[#2d88ff]' : 'border-gray-400'}`}>
                    {selectedFilters[id] === opt && <div className="w-2.5 h-2.5 bg-[#2d88ff] rounded-full" />}
                  </div>
                  <span className="text-[14px]">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={sidebarRef}
      className="w-[52px] bg-[#1554ad] flex flex-col items-center py-4 shrink-0 h-full select-none z-40 overflow-y-auto overscroll-contain custom-scrollbar"
    >
      <div className="flex flex-col w-full items-center gap-1.5">
        {/* Filter Icons */}
        {renderIcon("chat", MessageSquare, "Hội thoại")}
        {renderIcon("unread", User, "Lọc chưa đọc", FILTER_MENUS.unread)}
        {renderIcon("comments", MessageCircle, "Lọc bình luận", FILTER_MENUS.comments)}
        {renderIcon("messages", Mail, "Lọc tin nhắn", FILTER_MENUS.messages)}
        {renderIcon("reviews", Star, "Lọc đánh giá", FILTER_MENUS.reviews)}
        {renderIcon("phone", Phone, "Lọc có số điện thoại")}
        {renderIcon("phone-off", PhoneOff, "Lọc không có số điện thoại")}
        {renderIcon("clock", Clock, "Lọc theo thời gian")}
        {renderIcon("calendar", Calendar, "Lọc theo ngày")}
        {renderIcon("layers", Layers, "Lọc theo thẻ")}
        {renderIcon("users", Users, "Lọc theo người chia")}
      </div>
    </div>
  );
}
