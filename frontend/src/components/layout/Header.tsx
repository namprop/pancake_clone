"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown } from "lucide-react";
import { Dropdown } from "antd";
import type { SafeUser } from "@/types/user";
import { useAppContext } from "@/contexts/AppContext";

interface HeaderProps {
  user: SafeUser | null;
  activeShopName: string;
}

const TABS = [
  { href: "/inbox", label: "Hội thoại", badge: 1 },
  { href: "/orders", label: "Đơn hàng" },
  { href: "/posts", label: "Bài viết" },
  { href: "/dashboard", label: "Thống kê" },
  { href: "/facebook-connect", label: "Liên kết FB" },
  { href: "/settings", label: "Cài đặt" },
];

export default function Header({ user, activeShopName }: HeaderProps) {
  const pathname = usePathname();
  const { connectedPages, setActiveShopName, setActivePageId } = useAppContext();

  // Create menu items for Ant Design dropdown
  const menuItems = connectedPages.map((page) => ({
    key: page.pageId,
    label: (
      <div className="flex items-center gap-2.5 py-1 px-1.5 min-w-[180px]">
        <img
          src={page.pageAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb"}
          alt={page.pageName}
          className="w-6 h-6 rounded-full object-cover border border-sky-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb";
          }}
        />
        <span className="font-semibold text-slate-700 text-xs">{page.pageName}</span>
      </div>
    ),
    onClick: () => {
      setActiveShopName(page.pageName);
      setActivePageId(page.pageId);
    },
  }));

  // Fallback if no pages are connected yet
  const finalMenuItems =
    menuItems.length > 0
      ? menuItems
      : [
          {
            key: "mock-default",
            label: (
              <div className="flex items-center gap-2.5 py-1 px-1.5 min-w-[180px]">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
                  B
                </div>
                <span className="font-semibold text-slate-700 text-xs">Bella Boutique (Thời Trang)</span>
              </div>
            ),
            onClick: () => {
              setActiveShopName("Bella Boutique (Thời Trang)");
            },
          },
        ];

  return (
    <header className="h-12 bg-[#1554ad] text-white flex items-center justify-between px-4 shrink-0 z-50">
      {/* Left: Logo & Nav */}
      <div className="flex items-center h-full gap-8">
        <Link href="/inbox" className="flex items-center gap-2 pr-4">
          <svg viewBox="0 0 48 48" className="w-8 h-8">
            <path fill="#fff" d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 30c-5.52 0-10-4.48-10-10s4.48-10 10-10 10 4.48 10 10-4.48 10-10 10z" />
            <path fill="#1554ad" d="M24 18c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1.5 8h-2v-4h2v4zm4.5 0h-2v-4h2v4z" />
          </svg>
          <span className="font-semibold text-[17px] tracking-wide">HupunaCake</span>
        </Link>

        <nav className="hidden md:flex h-full items-center gap-1">
          {TABS.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative px-4 h-full flex items-center text-[13px] font-semibold transition hover:bg-white/10 ${isActive ? "bg-white/20" : ""
                  }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: User & Shop */}
      <div className="flex items-center gap-4 h-full">
        <Dropdown menu={{ items: finalMenuItems }} trigger={["click"]} placement="bottomRight">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-[#30487b] px-3 h-full transition select-none">
            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs uppercase">
              {activeShopName[0] || "B"}
            </div>
            <span className="text-[13px] font-semibold">{activeShopName.split(" ")[0] || "Shop"}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </div>
        </Dropdown>

        <button className="relative w-8 h-8 flex items-center justify-center hover:bg-[#30487b] rounded-full transition">
          <Bell className="w-4 h-4 fill-white" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-[#3b5998]"></span>
        </button>
      </div>
    </header>
  );
}
