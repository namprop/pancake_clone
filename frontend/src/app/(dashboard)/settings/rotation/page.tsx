"use client";

import React, { useState } from "react";
import { EyeOff, Hand, Users, User, Check, Eye, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { SettingCard } from "@/components/ui/SettingCard";
import { SettingRow } from "@/components/ui/SettingRow";
import { SettingPageHeader } from "@/components/ui/SettingPageHeader";
import { Button } from "antd";

const MODES = [
  { id: "off", label: "Tắt chế độ phân công", icon: EyeOff },
  { id: "self", label: "Nhân viên tự phân công", icon: Hand },
  { id: "group", label: "Phân công theo nhóm", icon: Users },
  { id: "custom", label: "Tuỳ chọn tài khoản", icon: User },
];

export default function RotationSettingsPage() {
  const [selectedMode, setSelectedMode] = useState("self");
  const [onlyViewOwn, setOnlyViewOwn] = useState(true);
  const [autoAssignFirstReply, setAutoAssignFirstReply] = useState(true);

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-8">
      <SettingPageHeader
        title="Chế độ xoay vòng"
        action={
          <Button type="primary" style={{ backgroundColor: "#185adb" }}>
            Lưu cài đặt
          </Button>
        }
      />

      {/* Mode selection */}
      <SettingCard title="Cài đặt chế độ">
        <p className="text-[13px] text-gray-500 mb-6 -mt-3">Chọn các chế độ chia hội thoại cho nhân viên</p>
        <div className="grid grid-cols-2 gap-4">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition border ${
                  isSelected ? "bg-[#dff0ff] border-transparent" : "bg-[#f5f6f8] border-transparent hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-5 h-5 ${isSelected ? "text-blue-600" : "text-gray-600"}`} />
                  <span className={`text-[14px] font-medium ${isSelected ? "text-blue-600" : "text-gray-700"}`}>
                    {mode.label}
                  </span>
                </div>
                {isSelected && <Check className="w-5 h-5 text-blue-600" />}
              </div>
            );
          })}
        </div>
      </SettingCard>

      {/* Detail config */}
      <SettingCard title="Cấu hình chi tiết">
        <p className="text-[13px] text-gray-500 mb-6 -mt-3">Cấu hình chi tiết cho chế độ chia hội thoại được chọn</p>
        <div className="space-y-6">
          <SettingRow
            icon={<Eye />}
            title={<span className="flex items-center gap-1.5">Quyền xem <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></span>}
          >
            <div />
          </SettingRow>

          <div className="pl-8 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <p className="text-[13px] text-gray-600">
                Nhân viên chỉ xem được hội thoại được chia cho mình và chưa được chia cho ai
              </p>
              <Switch checked={onlyViewOwn} onCheckedChange={setOnlyViewOwn} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-[13px] text-gray-600">
                Tự động phân công cho nhân viên nào trả lời tin nhắn đầu tiên
              </p>
              <Switch checked={autoAssignFirstReply} onCheckedChange={setAutoAssignFirstReply} />
            </div>
          </div>
        </div>
      </SettingCard>
    </div>
  );
}

