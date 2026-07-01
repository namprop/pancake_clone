"use client";

import React, { useState } from "react";
import { Contact, Glasses, Presentation, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { SettingCard } from "@/components/ui/SettingCard";
import { SettingRow } from "@/components/ui/SettingRow";
import { SettingPageHeader } from "@/components/ui/SettingPageHeader";
import { useAppContext } from "@/contexts/AppContext";

export default function InterfaceSettingsPage() {
  const { workspaceSettings, updateWorkspaceSettings } = useAppContext();

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-8">
      <SettingPageHeader title="Giao diện" />

      <SettingCard title="Cài đặt giao diện">
        <div className="space-y-6">
          <SettingRow
            icon={<Contact />}
            title={<span className="flex items-center gap-1.5">Hiển thị tài khoản được phân công chính <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></span>}
            description="Hiển thị tài khoản được phân công chính ở danh sách hội thoại"
          >
            <Switch 
              checked={workspaceSettings.interfaceSettings.showMainAssignee} 
              onCheckedChange={(checked) => updateWorkspaceSettings({ interfaceSettings: { ...workspaceSettings.interfaceSettings, showMainAssignee: checked } })} 
            />
          </SettingRow>

          <SettingRow
            divider
            icon={<Glasses />}
            title={<span className="flex items-center gap-1.5">Hiển thị tài khoản đang xem tin nhắn <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></span>}
            description="Hiển thị tài khoản đang xem tin nhắn ở danh sách hội thoại"
          >
            <Switch 
              checked={workspaceSettings.interfaceSettings.showViewingAccount} 
              onCheckedChange={(checked) => updateWorkspaceSettings({ interfaceSettings: { ...workspaceSettings.interfaceSettings, showViewingAccount: checked } })} 
            />
          </SettingRow>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Presentation className="w-5 h-5 text-gray-600" />
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-[14px] text-gray-800">Hiển thị trang</h4>
                <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
            <div className="pl-8">
              <div className="bg-[#f5f6f8] rounded-lg p-4 flex items-center justify-between relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#a68a56]" />
                <div className="flex items-center gap-4 pl-2">
                  <div className="w-12 h-12 bg-white rounded border border-gray-200 overflow-hidden flex flex-col relative shadow-sm shrink-0">
                    <div className="h-3 bg-blue-100 w-full" />
                    <div className="flex-1 p-1 space-y-1">
                      <div className="h-1 bg-gray-200 w-3/4 rounded" />
                      <div className="h-1 bg-gray-200 w-1/2 rounded" />
                      <div className="h-1 bg-green-500 w-full mt-2 rounded" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-semibold text-gray-800">Buôn Bán Niềm Tin</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-3.5 h-3.5 bg-blue-600 rounded-sm text-white text-[9px] flex items-center justify-center font-bold">f</span>
                      <span className="text-[12px] text-gray-500">1099824869891873</span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-4 bg-[#9d7d43] rounded-full mr-2" />
              </div>
            </div>
          </div>
        </div>
      </SettingCard>
    </div>
  );
}

