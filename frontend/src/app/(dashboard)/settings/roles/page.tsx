"use client";

import React from "react";
import { Table, Input } from "antd";
import { ChevronRight, ChevronDown, Lock, HelpCircle } from "lucide-react";
import { SettingPageHeader } from "@/components/ui/SettingPageHeader";
import { SettingCard } from "@/components/ui/SettingCard";
import { SearchInput } from "@/components/ui/SearchInput";

const BlueCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#7d95b5" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#7d95b5" />
    <path d="M8 12.5L10.5 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EmptyCircle = () => (
  <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300 mx-auto" />
);

const ROLES = [
  {
    key: "admin",
    role: <div className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-gray-500" /><span className="font-medium">Quản trị viên</span></div>,
    permissions: [true, true, true, true, true, true, true, true, true, true, true, true],
  },
  {
    key: "editor",
    role: (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><ChevronDown className="w-4 h-4 text-gray-500" /><span className="font-medium">Biên tập viên</span></div>
        <Lock className="w-4 h-4 text-[#185adb]" fill="#185adb" />
      </div>
    ),
    permissions: [true, true, true, true, true, true, true, true, false, false, true, true],
  },
  {
    key: "moderator",
    role: (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-gray-500" /><span className="font-medium">Người kiểm duyệt</span></div>
        <Lock className="w-4 h-4 text-[#185adb]" fill="#185adb" />
      </div>
    ),
    permissions: [true, true, true, true, true, true, true, true, false, false, true, true],
  },
  {
    key: "none",
    role: (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><ChevronRight className="w-4 h-4 text-gray-500" /><span className="font-medium text-gray-700">Mất quyền</span></div>
        <HelpCircle className="w-4 h-4 text-gray-500" />
      </div>
    ),
    permissions: [false, false, false, false, false, false, false, false, false, false, false, false],
  },
];

const PERM_KEYS = ["p0","p1","p2","p3","p4","p5","p6","p7","p8","p9","p10","p11"];

const permissionColumns = [
  {
    title: "Vai trò người dùng",
    dataIndex: "role",
    key: "role",
    width: 200,
    fixed: "left" as const,
  },
  {
    title: "Bài viết",
    children: [
      { title: <span className="text-xs">Tải xuống số điện thoại</span>, key: "p0", dataIndex: "p0", width: 80, align: "center" as const },
      { title: <span className="text-xs">Tải xuống bình luận</span>, key: "p1", dataIndex: "p1", width: 80, align: "center" as const },
    ],
  },
  {
    title: "Sao lưu",
    children: [
      { title: <span className="text-xs">Tin nhắn từ hội thoại</span>, key: "p2", dataIndex: "p2", width: 80, align: "center" as const },
      { title: <span className="text-xs">Cuộc gọi và ghi âm</span>, key: "p3", dataIndex: "p3", width: 80, align: "center" as const },
      { title: <span className="text-xs">Thông tin khách hàng</span>, key: "p4", dataIndex: "p4", width: 80, align: "center" as const },
    ],
  },
  {
    title: "Cài đặt",
    children: [
      { title: <span className="text-xs">Cài đặt chung</span>, key: "p5", dataIndex: "p5", width: 80, align: "center" as const },
      { title: <span className="text-xs">Cài đặt thẻ</span>, key: "p6", dataIndex: "p6", width: 80, align: "center" as const },
      { title: <span className="text-xs">Hỗ trợ trả lời</span>, key: "p7", dataIndex: "p7", width: 80, align: "center" as const },
      { title: <span className="text-xs">Chế độ xoay vòng</span>, key: "p8", dataIndex: "p8", width: 80, align: "center" as const },
    ],
  },
  {
    title: "Thống kê",
    children: [
      { title: <span className="text-xs">Quảng cáo</span>, key: "p9", dataIndex: "p9", width: 80, align: "center" as const },
      { title: <span className="text-xs">Khác</span>, key: "p10", dataIndex: "p10", width: 80, align: "center" as const },
    ],
  },
  {
    title: "Media & File",
    key: "p11",
    dataIndex: "p11",
    width: 80,
    align: "center" as const,
  },
];

const dataSource = ROLES.map((r) => {
  const row: Record<string, any> = { key: r.key, role: r.role };
  r.permissions.forEach((p, i) => {
    row[`p${i}`] = p ? <div className="flex justify-center"><BlueCheck /></div> : <EmptyCircle />;
  });
  return row;
});

export default function RolesSettingsPage() {
  return (
    <div className="max-w-[1400px] mx-auto py-8 px-8">
      <SettingPageHeader title="Phân quyền" />

      <SettingCard>
        <div className="mb-6">
          <SearchInput placeholder="Tìm kiếm tài khoản" width={320} />
        </div>

        <div className="flex items-center gap-8 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#185adb] rounded flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-[13px] text-gray-700 font-medium">Chọn quyền cá nhân</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-[13px] text-gray-700 font-medium">Quyền theo vai trò trên trang</span>
          </div>
        </div>

        <Table
          columns={permissionColumns as any}
          dataSource={dataSource}
          rowKey="key"
          pagination={false}
          bordered
          size="middle"
          scroll={{ x: "max-content" }}
          rowClassName={(_, index) => (index === 3 ? "bg-[#f5f6f8]" : "")}
        />
      </SettingCard>
    </div>
  );
}

