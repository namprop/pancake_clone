"use client";

import React, { useState } from "react";
import {
  Search, Link as LinkIcon, PlusCircle, Info, CheckCheck,
  EyeOff, ThumbsUp, Tags, Radio, Inbox,
  Music, Globe, FileText, Copy, Trash2, Plus,
  Cloud as CloudIcon, PenTool,
} from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { SettingCard } from "@/components/ui/SettingCard";
import { SettingRow } from "@/components/ui/SettingRow";
import { SettingPageHeader } from "@/components/ui/SettingPageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, Button, Alert } from "antd";

const adColumns = (extraCol: string) => [
  { title: "ID Tài khoản quảng cáo", key: "adId", dataIndex: "adId" },
  { title: "Tên tài khoản QC", key: "name", dataIndex: "name" },
  { title: "Trạng thái", key: "status", dataIndex: "status" },
  { title: extraCol, key: "extra", dataIndex: "extra" },
];

const trackingColumns = [
  { title: "Nguồn truy cập", key: "source", dataIndex: "source" },
  { title: "Đường dẫn URL", key: "url", dataIndex: "url" },
  { title: "Tin nhắn soạn sẵn", key: "message", dataIndex: "message" },
];

export default function ToolsSettingsPage() {
  const [markUnreadTiktok, setMarkUnreadTiktok] = useState(false);
  const [signatureEnabled, setSignatureEnabled] = useState(false);
  const [separateSignature, setSeparateSignature] = useState(true);

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-8">
      <SettingPageHeader title="Công cụ" />

      {/* TikTok Ads */}
      <SettingCard>
        <div className="flex items-center gap-3 mb-1">
          <Music className="w-5 h-5 text-gray-800" />
          <h3 className="font-bold text-[15px] text-gray-800">Cài đặt TikTok Ads</h3>
        </div>
        <p className="text-[13px] text-gray-500 mb-4 pl-8">Cài đặt mở rộng để theo dõi hiệu quả quảng cáo TikTok Ads</p>

        <div className="ml-8 mb-4">
          <Alert
            message="Sử dụng tính năng này đồng nghĩa với việc bạn đồng ý gửi sự kiện và thông tin đã được mã hoá về TikTok để tối ưu quảng cáo"
            type="info"
            showIcon
            className="mb-4"
          />

          <div className="flex items-center justify-between mb-4">
            <SearchInput />
            <div className="flex gap-2">
              <Button icon={<FileText className="w-4 h-4" />}>ID trang</Button>
              <Button icon={<LinkIcon className="w-4 h-4" />}>Kết nối</Button>
              <Button icon={<PlusCircle className="w-4 h-4" />}>Tạo mới</Button>
            </div>
          </div>

          <Table
            columns={adColumns("Pixel ID")}
            dataSource={[]}
            rowKey="adId"
            size="small"
            bordered
            pagination={false}
            locale={{ emptyText: <EmptyState /> }}
            className="mb-4"
          />

          <SettingRow
            title="Đánh dấu chưa đọc hội thoại"
            description="Khi khách hàng nhấp vào quảng cáo TikTok nhưng chưa nhắn tin, hệ thống sẽ đánh dấu hội thoại là chưa đọc nếu bạn bật tuỳ chọn này"
          >
            <Switch checked={markUnreadTiktok} onCheckedChange={setMarkUnreadTiktok} />
          </SettingRow>
        </div>
      </SettingCard>

      {/* Google Ads */}
      <SettingCard>
        <div className="flex items-center gap-3 mb-1">
          <Globe className="w-5 h-5 text-gray-800" />
          <h3 className="font-bold text-[15px] text-gray-800">Cài đặt Google Ads</h3>
        </div>
        <p className="text-[13px] text-gray-500 mb-6 pl-8">Các cài đặt bổ sung để theo dõi hiệu quả của Google Ads</p>
        <div className="ml-8">
          <div className="flex items-center justify-between mb-4">
            <SearchInput />
            <div className="flex gap-2">
              <Button icon={<FileText className="w-4 h-4" />}>ID trang</Button>
              <Button icon={<LinkIcon className="w-4 h-4" />}>Kết nối</Button>
            </div>
          </div>
          <Table
            columns={adColumns("Tên mục tiêu chuyển đổi")}
            dataSource={[]}
            rowKey="adId"
            size="small"
            bordered
            pagination={false}
            locale={{ emptyText: <EmptyState /> }}
          />
        </div>
      </SettingCard>

      {/* Chức năng */}
      <SettingCard title="Chức năng">
        <div className="space-y-6">
          <SettingRow
            icon={<CheckCheck />}
            title="Đánh dấu đã đọc toàn bộ"
            description="Tuỳ chọn đánh dấu đã đọc tin nhắn và bình luận"
          >
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              {["Tin nhắn", "Bình luận", "Tất cả"].map((label, i, arr) => (
                <button
                  key={label}
                  className={`px-4 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 transition ${i < arr.length - 1 ? "border-r border-gray-300" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow divider icon={<EyeOff />} title="Ẩn và hiển thị bình luận" description="Ẩn hoặc bỏ ẩn bình luận hàng loạt của bài viết trên trang">
            <button className="text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition">Thực hiện</button>
          </SettingRow>

          <SettingRow divider icon={<ThumbsUp />} title="Mời khách hàng thích trang" description="Mời khách hàng đã thả cảm xúc bài viết thích trang của bạn">
            <button className="text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition">Thực hiện</button>
          </SettingRow>

          <SettingRow divider icon={<Tags />} title="Gắn thẻ hàng loạt" description="Gắn thẻ cho nhiều hội thoại cùng lúc. Các hành động gắn thẻ này không được tính vào thống kê.">
            <button className="text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition">Cài đặt</button>
          </SettingRow>

          <SettingRow divider icon={<Radio />} title="Kiểm tra Live Video Ads" description="Kiểm tra trang của bạn có thể gắn được sản phẩm lên livestream và TKQC của bạn có chạy được quảng cáo livestream hay không">
            <button className="text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition">Kiểm tra</button>
          </SettingRow>
        </div>
      </SettingCard>

      {/* Public API access token */}
      <SettingCard>
        <h3 className="font-bold text-[14px] text-gray-800 mb-4">Public API access token</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 flex bg-[#f5f6f8] border border-gray-200 rounded-md overflow-hidden">
            <input type="text" value="Nhấn Tạo để tạo token mới" disabled className="flex-1 bg-transparent px-3 text-[13px] text-gray-500 outline-none" />
            <button className="h-9 px-4 bg-white text-blue-600 font-semibold text-[13px] border-l border-gray-200 hover:bg-gray-50 transition">Tạo Token</button>
          </div>
          <button className="flex items-center gap-1.5 text-[13px] text-gray-600 font-medium hover:text-gray-900 transition"><Copy className="w-4 h-4" />Sao chép</button>
          <button className="flex items-center gap-1.5 text-[13px] text-gray-600 font-medium hover:text-red-600 transition"><Trash2 className="w-4 h-4" />Xoá token</button>
        </div>
      </SettingCard>

      {/* Refresh Preview URL */}
      <SettingCard>
        <h3 className="font-bold text-[14px] text-gray-800 mb-4">Refresh Preview URL</h3>
        <div className="flex bg-[#f5f6f8] border border-gray-200 rounded-md overflow-hidden max-w-3xl">
          <input type="text" placeholder="Website URL" className="flex-1 bg-transparent px-3 h-9 text-[13px] outline-none text-gray-800 placeholder-gray-400" />
          <button className="h-9 px-6 bg-white text-blue-600 font-semibold text-[13px] border-l border-gray-200 hover:bg-gray-50 transition">Cập nhật</button>
        </div>
      </SettingCard>

      {/* Tracking URLs */}
      <SettingCard title="Tạo đường dẫn với nguồn truy cập">
        <p className="text-[13px] text-gray-500 mb-6 -mt-3">
          Đường dẫn m.me có gắn thông tin nguồn truy cập. <span className="text-blue-600 cursor-pointer hover:underline">Tìm hiểu thêm</span>
        </p>
        <div className="flex items-center justify-between mb-4">
          <SearchInput placeholder="Tìm kiếm đường dẫn, tên nguồn" />
          <Button type="primary" ghost icon={<Plus className="w-4 h-4" />} style={{ color: "#185adb", borderColor: "#185adb" }}>Thêm mới</Button>
        </div>
        <Table
          columns={trackingColumns}
          dataSource={[]}
          rowKey="source"
          size="small"
          bordered
          pagination={false}
          locale={{
            emptyText: (
              <div className="py-12 flex flex-col items-center">
                <CloudIcon className="w-16 h-16 text-[#e2e8f0] mb-3" />
                <p className="text-[14px] font-medium text-gray-600 mb-1">Bạn chưa có đường dẫn nào</p>
                <p className="text-[13px] text-gray-400">Nhấn "Thêm mới" để bắt đầu tạo đường dẫn</p>
              </div>
            ),
          }}
        />
      </SettingCard>

      {/* Chữ ký */}
      <SettingCard title="Chữ ký">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[14px] font-bold text-gray-700">Bật chữ ký</span>
          <Switch checked={signatureEnabled} onCheckedChange={setSignatureEnabled} />
        </div>

        <div className="relative mb-2">
          <textarea
            disabled={!signatureEnabled}
            placeholder="Nhập chữ ký của bạn (Tối đa 150 ký tự)"
            className="w-full h-24 border border-gray-300 rounded-md p-3 text-[13px] outline-none focus:border-blue-500 resize-none disabled:bg-gray-50 disabled:text-gray-400"
          />
          <PenTool className="absolute bottom-3 right-3 w-4 h-4 text-gray-400" />
        </div>

        <div className="flex justify-end items-center gap-2 mb-6">
          <span className="text-[12px] text-gray-600 font-medium">Phân tách nội dung tin nhắn và chữ ký bằng một dòng mới</span>
          <input type="checkbox" checked={separateSignature} onChange={(e) => setSeparateSignature(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
        </div>

        <div className="mb-4">
          <h4 className="text-[13px] font-bold text-gray-800 mb-2">Xem trước</h4>
          <div className="bg-[#f0ece6] p-8 rounded-md flex items-center justify-center min-h-[120px]">
            <div className="bg-[#dcf8c6] text-gray-800 text-[13px] p-3 rounded-lg shadow-sm border border-[#c3ebac] max-w-md relative">
              <p>Dear customers,</p>
              <p>We are working hard to bring you better service!</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button style={{ backgroundColor: "#869ab8", color: "white", borderColor: "#869ab8" }}>Lưu</Button>
        </div>
      </SettingCard>
    </div>
  );
}

