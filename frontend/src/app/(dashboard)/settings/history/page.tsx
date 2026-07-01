"use client";

import React, { useState } from "react";
import { User, Info, ArrowRight } from "lucide-react";
import { Tabs, Timeline, Tag, Badge } from "antd";
import { SettingPageHeader } from "@/components/ui/SettingPageHeader";
import { SettingCard } from "@/components/ui/SettingCard";

const HISTORY_DATA = [
  {
    id: "e5d1a703",
    name: "Phạm Tiến Nam",
    time: "09:39",
    desc: "Hiển thị tài khoản đang xem tin nhắn",
    from: "ON",
    to: "OFF",
    isCurrent: true,
  },
  {
    id: "b9459926",
    name: "Phạm Tiến Nam",
    time: "09:39",
    desc: "Hiển thị tài khoản được phân công chính ở danh sách hội thoại",
    from: "ON",
    to: "OFF",
  },
  {
    id: "61b9f7f1",
    name: "Phạm Tiến Nam",
    time: "09:39",
    desc: "Hiển thị tài khoản được phân công chính ở danh sách hội thoại",
    from: "OFF",
    to: "ON",
  },
  {
    id: "07210cbf",
    name: "Phạm Tiến Nam",
    time: "09:39",
    desc: "Hiển thị tài khoản đang xem tin nhắn",
    from: "OFF",
    to: "ON",
  },
  {
    id: "4a326466",
    name: "Phạm Tiến Nam",
    time: "08:50",
    desc: "Cài đặt tính năng gọi",
    isUpdate: true,
  },
  {
    id: "6875c76b",
    name: "Phạm Tiến Nam",
    time: "10:51 hôm qua",
    desc: "đã kích hoạt lại trang",
    isActivate: true,
    isLast: true,
  },
];

const TABS = [
  { key: "settings", label: "Cài đặt" },
  { key: "comments", label: "Xóa bình luận" },
  { key: "block", label: "Chặn khách hàng" },
  { key: "violation", label: "Vi phạm" },
  { key: "rotation", label: "Chế độ xoay vòng" },
];

export default function HistorySettingsPage() {
  const timelineItems = HISTORY_DATA.map((item) => ({
    color: item.isLast ? "green" : "gray",
    children: (
      <div className="pb-2">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              <User className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-bold text-gray-800">{item.name}</span>
            <span className="text-[12px] text-gray-500">{item.time}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {item.isCurrent && (
              <Tag color="success" bordered>Hiện tại</Tag>
            )}
            {item.from && item.to && (
              <div className="flex items-center gap-1.5">
                <Tag color={item.from === "ON" ? "success" : "error"} className="font-bold">{item.from}</Tag>
                <ArrowRight className="w-3 h-3 text-gray-400" />
                <Tag color={item.to === "ON" ? "success" : "error"} className="font-bold">{item.to}</Tag>
              </div>
            )}
            <Tag bordered={false} style={{ backgroundColor: "#e8f0fe", color: "#1554ad" }}>{item.id}</Tag>
          </div>
        </div>

        <div className="ml-8">
          {item.isActivate ? (
            <p className="text-[13px] text-gray-600">
              đã <span className="text-green-600 font-medium">kích hoạt</span> lại trang
            </p>
          ) : item.isUpdate ? (
            <div className="flex items-center gap-2">
              <p className="text-[13px] text-gray-600">{item.desc}</p>
              <Tag>Đã cập nhật</Tag>
            </div>
          ) : (
            <p className="text-[13px] text-gray-600">{item.desc}</p>
          )}
        </div>
      </div>
    ),
  }));

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-8">
      <SettingPageHeader title="Lịch sử" />

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 px-4">
        <Tabs items={TABS} defaultActiveKey="settings" />
      </div>

      <div className="flex items-start gap-6">
        {/* Timeline */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Timeline items={timelineItems} />
          <div className="text-center pt-4 pb-2">
            <span className="text-[13px] font-medium text-gray-400">Hết dữ liệu lưu trữ</span>
          </div>
        </div>

        {/* Notice Card */}
        <div className="w-[360px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
          <div className="p-5 pl-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-blue-500" />
              <h3 className="text-[15px] font-bold text-gray-800">Lưu ý</h3>
            </div>
            <ul className="space-y-3">
              {[
                "Chức năng khôi phục sẽ xoá những thay đổi sau thời điểm bạn chọn",
                "Thẻ hội thoại đã bị xoá sẽ không thể khôi phục",
                "Cài đặt được thay đổi bởi hệ thống sẽ không thể khôi phục",
                "Lịch sử cài đặt được lưu tối đa 500 bản ghi",
                "Các thao tác phân quyền không thể khôi phục",
              ].map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-500 rounded-full mt-2 shrink-0" />
                  <p className="text-[13px] text-gray-600 leading-snug">{note}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

