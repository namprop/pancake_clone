"use client";

import React, { useState } from "react";
import { Table, Tabs, Button } from "antd";
import { SettingCard } from "@/components/ui/SettingCard";
import { SettingPageHeader } from "@/components/ui/SettingPageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";

const SYNC_TABS = [
  { key: "images", label: "Ảnh" },
  { key: "quick_reply", label: "Trả lời nhanh" },
  { key: "tags", label: "Thẻ hội thoại" },
  { key: "history", label: "Lịch sử đồng bộ" },
];

const syncColumns = [
  { title: "STT", key: "stt", width: 80, align: "center" as const },
  { title: "Tên nhóm đồng bộ", key: "name" },
  { title: "Thời gian cập nhật", key: "updatedAt" },
  { title: "Trang đồng bộ", key: "page" },
  { title: "", key: "actions", width: 100 },
];

export default function SyncSettingsPage() {
  return (
    <div className="max-w-[1100px] mx-auto py-8 px-8">
      <SettingPageHeader title="Đồng bộ" />

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 px-6">
        <Tabs items={SYNC_TABS} defaultActiveKey="images" />
      </div>

      {/* Content */}
      <SettingCard>
        <div className="flex items-center justify-between mb-6">
          <SearchInput placeholder="Tìm kiếm tên nhóm" />
          <Button type="primary" style={{ backgroundColor: "#185adb" }}>Tạo nhóm đồng bộ</Button>
        </div>

        <Table
          columns={syncColumns}
          dataSource={[]}
          rowKey="key"
          size="small"
          pagination={false}
          bordered
          locale={{ emptyText: <EmptyState /> }}
        />
      </SettingCard>
    </div>
  );
}

