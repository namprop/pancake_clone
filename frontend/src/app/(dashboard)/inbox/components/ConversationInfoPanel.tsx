"use client";

import type { ReactNode } from "react";
import { Customer } from "@/types";
import {
  AlarmClock,
  AlertOctagon,
  Ban,
  BellOff,
  Bookmark,
  Cake,
  ExternalLink,
  FileText,
  Images,
  Infinity,
  Link as LinkIcon,
  Search,
  X,
} from "lucide-react";
import { message } from "antd";

interface ConversationInfoPanelProps {
  customer: Customer | undefined;
  onClose: () => void;
}

function actionMessage(text: string) {
  message.info(text);
}

function getGenderLabel(gender?: Customer["gender"]) {
  if (gender === "female") return "Nữ";
  if (gender === "unknown") return "Không xác định";
  return "Nam";
}

function formatBirthdayDisplay(value?: string | null) {
  if (!value) return "Chọn ngày sinh";

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "Chọn ngày sinh";

  return `${day}/${month}/${year}`;
}

export default function ConversationInfoPanel({
  customer,
  onClose,
}: ConversationInfoPanelProps) {
  if (!customer) {
    return (
      <aside className="w-full h-full bg-white border-l border-gray-200 flex flex-col">
        <Header onClose={onClose} />
        <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
          Chưa chọn hội thoại
        </div>
      </aside>
    );
  }

  const conversationIdentity = customer.facebookCustomerId || customer.id || "";
  const facebookProfileUrl = conversationIdentity
    ? `https://www.facebook.com/${conversationIdentity}`
    : "";

  return (
    <aside className="w-full h-full bg-white border-l border-gray-200 flex flex-col select-none">
      <Header onClose={onClose} />

      <div className="flex-1 overflow-y-auto px-5 py-5 text-slate-700">
        <div className="flex flex-col items-center text-center">
          <img
            src={customer.avatar}
            alt={customer.name}
            className="w-[54px] h-[54px] rounded-full object-cover border border-gray-200"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=3b5998&color=fff`;
            }}
          />
          <div className="mt-3 text-[18px] leading-tight font-semibold text-slate-800">
            {customer.name}
          </div>
          <div className="mt-1.5 text-[13px] text-slate-500">
            ID: {conversationIdentity}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-7 text-[13px]">
          <span className="text-slate-500">Giới tính:</span>
          <span className="font-medium text-slate-800">{getGenderLabel(customer.gender)}</span>
        </div>

        <div className="mt-5 border-t border-gray-200 pt-6">
          <div className="grid grid-cols-3 gap-x-4 gap-y-6">
            <InfoAction
              icon={<ExternalLink className="w-[18px] h-[18px]" />}
              label={<>Xem trên<br />Facebook</>}
              onClick={() => {
                if (facebookProfileUrl) {
                  window.open(facebookProfileUrl, "_blank", "noopener,noreferrer");
                }
              }}
            />
            <InfoAction
              icon={<Ban className="w-[18px] h-[18px]" />}
              label="Chặn"
              onClick={() => actionMessage("Đã ghi nhận thao tác chặn")}
            />
            <InfoAction
              icon={<Search className="w-[18px] h-[18px]" />}
              label={<>Tìm kiếm tin<br />nhắn</>}
              onClick={() => actionMessage("Tính năng tìm kiếm tin nhắn sẽ được bổ sung")}
            />
            <InfoAction
              icon={<Bookmark className="w-[18px] h-[18px]" />}
              label="Ghim hội thoại"
              onClick={() => message.success("Đã ghim hội thoại")}
            />
            <InfoAction
              icon={<BellOff className="w-[18px] h-[18px]" />}
              label="Tắt thông báo"
              onClick={() => message.success("Đã tắt thông báo")}
            />
            <InfoAction
              icon={<Infinity className="w-[18px] h-[18px]" />}
              label="Kích hoạt BizAI"
              onClick={() => message.success("Đã kích hoạt BizAI cho hội thoại")}
            />
          </div>
        </div>

        <div className="mt-8 space-y-5 text-[14px]">
          <InfoRow icon={<AlarmClock className="w-[18px] h-[18px]" />} label="Hẹn thông báo" />
          <InfoRow icon={<Images className="w-[18px] h-[18px]" />} label="Ảnh/Video" />
          <InfoRow icon={<FileText className="w-[18px] h-[18px]" />} label="Tập tin" />
          <InfoRow icon={<LinkIcon className="w-[18px] h-[18px]" />} label="Liên kết" />
          <InfoRow icon={<Cake className="w-[18px] h-[18px]" />} label={formatBirthdayDisplay(customer.birthday)} />
          <InfoRow
            icon={<AlertOctagon className="w-[18px] h-[18px]" />}
            label="Báo cáo Spam"
            danger
          />
        </div>
      </div>
    </aside>
  );
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <div className="h-[50px] px-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
      <button
        type="button"
        onClick={onClose}
        className="w-7 h-7 rounded-md hover:bg-gray-100 text-slate-500 flex items-center justify-center transition-colors"
        title="Đóng"
      >
        <X className="w-[18px] h-[18px]" />
      </button>
      <div className="font-bold text-[15px] text-slate-800">
        Thông tin hội thoại
      </div>
    </div>
  );
}

function InfoAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 text-[12px] text-slate-700 hover:text-blue-600 transition-colors"
    >
      <span className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-slate-600">
        {icon}
      </span>
      <span className="leading-snug">{label}</span>
    </button>
  );
}

function InfoRow({
  icon,
  label,
  danger = false,
}: {
  icon: ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-3 transition-colors ${
        danger
          ? "text-rose-500 hover:text-rose-600"
          : "text-slate-700 hover:text-blue-600"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
