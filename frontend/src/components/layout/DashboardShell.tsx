"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import type { SafeUser } from "@/types/user";
import { Button } from "@/components/ui/Button";

interface DashboardShellProps {
  user: SafeUser | null;
  children: React.ReactNode;
}

function DashboardLayout({
  user,
  children,
}: {
  user: SafeUser | null;
  children: React.ReactNode;
}) {
  const { activeShopName, setActiveShopName, unreadCountSum } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isSettings = pathname.startsWith("/settings");

  return (
    <div className="w-full h-screen flex flex-col font-sans overflow-hidden bg-[#1554ad]">
      <Header user={user} activeShopName={activeShopName} />
      
      <div className="flex-1 flex overflow-hidden min-h-0 min-w-0">
        {!isSettings && (
          <Sidebar
            user={user}
            activeShopName={activeShopName}
            setActiveShopName={setActiveShopName}
            unreadCountSum={unreadCountSum}
            onToggle={() => {}}
          />
        )}

        <div className="flex-1 flex overflow-hidden bg-white rounded-tl-2xl min-h-0 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <AppProvider user={user}>
      <DashboardLayout user={user}>{children}</DashboardLayout>
    </AppProvider>
  );
}
