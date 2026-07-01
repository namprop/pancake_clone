"use client";

import React, { useState } from "react";
import {
  Bell, Inbox, Mail, Image as ImageIcon, EyeOff,
  AtSign, CheckCheck, Cake, ThumbsUp, Folder,
  GitBranch, ShoppingCart, Coffee, Cloud
} from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { Select } from "@/components/ui/Select";
import { SettingCard } from "@/components/ui/SettingCard";
import { SettingRow } from "@/components/ui/SettingRow";
import { SettingPageHeader } from "@/components/ui/SettingPageHeader";

import { useAppContext } from "@/contexts/AppContext";

export default function GeneralSettingsPage() {
  const { workspaceSettings, updateWorkspaceSettings } = useAppContext();
  
  // Local state to prevent full page re-render jitter, but syncs with DB
  const [settings, setSettings] = useState({
    browserNotify: true,
    playSound: "Mặc định",
    pushUnread: true,
    quickSwitch: "Tắt",
    useTasks: "Tắt",
    groupImages: "Gửi nhóm ảnh",
    autoHideComment: "Tắt",
    autoHideCommentPast: "Tắt",
    autoHideSpam: false,
    autoIgnoreTag: false,
    autoIgnoreSticker: false,
    autoSaveBirthday: false,
    autoLikeComment: false,
    sendLeadEvent: true,
    sendPurchaseEvent: true,
    ignoreSpamFolder: false,
    autoCreatePosOrder: true,
    botcakeNotify: true,
    botcakeSync: false,
  });

  // Sync with DB context on load
  React.useEffect(() => {
    if (workspaceSettings?.generalSettings) {
      setSettings(prev => ({
        ...prev,
        ...workspaceSettings.generalSettings
      }));
    }
  }, [workspaceSettings?.generalSettings]);

  const set = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    updateWorkspaceSettings({
      generalSettings: {
        ...settings,
        [key]: value
      }
    });
  };

  return (
    <div className="max-w-[900px] mx-auto py-8 px-8">
      <SettingPageHeader title="Cài đặt chung" />

      {/* Thông báo và hội thoại */}
      <SettingCard title="Thông báo và hội thoại">
        <div className="space-y-6">
          <SettingRow
            icon={<Bell />}
            title="Âm thanh và thông báo"
            description="Thông báo qua trình duyệt khi có tin nhắn mới hoặc bình luận mới"
          >
            <Switch checked={settings.browserNotify} onCheckedChange={(v) => set("browserNotify", v)} />
          </SettingRow>

          <SettingRow
            divider
            icon={<Bell />}
            title="Phát âm thanh khi có hội thoại mới"
          >
            <Select
              value={settings.playSound}
              onValueChange={(v) => set("playSound", v)}
              style={{ width: 180 }}
              options={[
                { value: "Mặc định", label: "Mặc định" },
                { value: "Tiếng chuông", label: "Tiếng chuông" },
                { value: "Tắt", label: "Tắt" },
              ]}
            />
          </SettingRow>

          <SettingRow
            divider
            icon={<Inbox />}
            title="Hội thoại"
            description="Đẩy những hội thoại chưa đọc lên đầu danh sách hội thoại"
          >
            <Switch checked={settings.pushUnread} onCheckedChange={(v) => set("pushUnread", v)} />
          </SettingRow>

          <SettingRow
            divider
            icon={<Inbox />}
            title="Chuyển nhanh sang tin nhắn chưa đọc kế tiếp"
          >
            <Select
              value={settings.quickSwitch}
              onValueChange={(v) => set("quickSwitch", v)}
              style={{ width: 180 }}
              options={[
                { value: "Tắt", label: "Tắt" },
                { value: "Bật", label: "Bật" },
              ]}
            />
          </SettingRow>

          <SettingRow
            divider
            icon={<Mail />}
            title="Tác vụ trong hội thoại"
            description="Sử dụng tính năng Hoàn thành tác vụ / Mở lại tác vụ trong các hội thoại"
          >
            <Select
              value={settings.useTasks}
              onValueChange={(v) => set("useTasks", v)}
              style={{ width: 180 }}
              options={[
                { value: "Tắt", label: "Tắt" },
                { value: "Bật", label: "Bật" },
              ]}
            />
          </SettingRow>

          <SettingRow
            divider
            icon={<ImageIcon />}
            title="Cách gửi tin nhắn chứa nhiều ảnh"
            description="Gộp các ảnh thành một nhóm rồi gửi tới người nhận"
          >
            <Select
              value={settings.groupImages}
              onValueChange={(v) => set("groupImages", v)}
              style={{ width: 180 }}
              options={[
                { value: "Gửi nhóm ảnh", label: "Gửi nhóm ảnh" },
                { value: "Gửi từng ảnh", label: "Gửi từng ảnh rời rạc" },
              ]}
            />
          </SettingRow>
        </div>
      </SettingCard>

      {/* Tính năng tự động */}
      <SettingCard title="Tính năng tự động">
        <div className="space-y-6">
          <SettingRow
            icon={<EyeOff />}
            title="Tự động ẩn bình luận"
            description={
              <>
                Ẩn bình luận các bài viết{" "}
                <a href="#" className="text-blue-500 hover:underline">
                  Bài viết
                </a>
              </>
            }
          >
            <Select
              value={settings.autoHideComment}
              onValueChange={(v) => set("autoHideComment", v)}
              style={{ width: 100 }}
              options={[
                { value: "Tắt", label: "Tắt" },
                { value: "Bật", label: "Bật" },
              ]}
            />
          </SettingRow>

          <SettingRow
            divider
            title="Ẩn tất cả bình luận Spam 🛡️"
            description="Bình luận spam sẽ tự động được ẩn đi"
          >
            <Switch checked={settings.autoHideSpam} onCheckedChange={(v) => set("autoHideSpam", v)} />
          </SettingRow>

          <SettingRow
            divider
            icon={<AtSign />}
            title="Tự động bỏ qua bình luận tag bạn bè"
            description="Bỏ qua tin nhắn nếu tin nhắn mới là bình luận khách hàng tag bạn bè"
          >
            <Switch checked={settings.autoIgnoreTag} onCheckedChange={(v) => set("autoIgnoreTag", v)} />
          </SettingRow>

          <SettingRow
            divider
            icon={<CheckCheck />}
            title="Tự động bỏ qua tin nhắn mới là sticker"
            description="Nếu tin nhắn mới của khách hàng là sticker, bật tùy chọn này sẽ giúp trạng thái xem của hội thoại không thay đổi"
          >
            <Switch checked={settings.autoIgnoreSticker} onCheckedChange={(v) => set("autoIgnoreSticker", v)} />
          </SettingRow>

          <SettingRow
            divider
            icon={<Cake />}
            title="Tự động lưu ngày sinh"
            description="Phát hiện và lưu ngày sinh của khách hàng gửi tin nhắn đến"
          >
            <Switch checked={settings.autoSaveBirthday} onCheckedChange={(v) => set("autoSaveBirthday", v)} />
          </SettingRow>

          <SettingRow
            divider
            icon={<ThumbsUp />}
            title="Tự động thích bình luận"
            description="Tự động ấn thích bình luận của khách hàng khi trả lời"
          >
            <Switch checked={settings.autoLikeComment} onCheckedChange={(v) => set("autoLikeComment", v)} />
          </SettingRow>

          <SettingRow
            divider
            icon={<Cloud />}
            title="Gửi sự kiện cho Meta để tối ưu quảng cáo"
            description="Tự động phát hiện và gửi toàn bộ sự kiện Lead cho Meta"
          >
            <Switch checked={settings.sendLeadEvent} onCheckedChange={(v) => set("sendLeadEvent", v)} />
          </SettingRow>

          <SettingRow
            divider
            icon={<Folder />}
            title="Bỏ qua thư mục Spam, Done"
            description="Thư mục Spam chứa tin nhắn được cho là Spam. Tuy nhiên, một số tin nhắn của khách hàng cũng có thể bị Facebook đưa nhầm vào mục này."
          >
            <Switch checked={settings.ignoreSpamFolder} onCheckedChange={(v) => set("ignoreSpamFolder", v)} />
          </SettingRow>
        </div>
      </SettingCard>

      {/* Đồng bộ hệ sinh thái */}
      <SettingCard title="Đồng bộ hệ sinh thái">
        <div className="space-y-6">
          <SettingRow
            icon={<GitBranch />}
            title="Nền tảng vận hành chính"
            description={
              <>
                Sử dụng POS nếu bạn thiên về quản lý sản phẩm, đơn, kho bãi...{" "}
                <a href="#" className="text-blue-500 hover:underline">Tìm hiểu thêm</a>
              </>
            }
          >
            <button className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50 transition shrink-0">
              <span className="text-blue-600 font-bold text-lg italic">P</span>
              <span className="text-sm font-semibold text-slate-700">Hupunacake POS</span>
            </button>
          </SettingRow>

          <SettingRow
            divider
            icon={<ShoppingCart />}
            title="Tạo đơn trên POS tự động"
            description={<>Đơn hàng mới sẽ được tự động tạo trên POS khi tin nhắn <strong>có chứa số điện thoại</strong></>}
          >
            <Switch checked={settings.autoCreatePosOrder} onCheckedChange={(v) => set("autoCreatePosOrder", v)} />
          </SettingRow>

          <SettingRow
            divider
            icon={<Coffee />}
            title="Thông báo Botcake"
            description={<>Hiển thị thông báo khi <strong>Botcake</strong> trả lời tự động</>}
          >
            <Switch checked={settings.botcakeNotify} onCheckedChange={(v) => set("botcakeNotify", v)} />
          </SettingRow>

          <SettingRow
            divider
            title="Đồng bộ Botcake theo tag"
            description={<>Khi (gán/gỡ) tag khách hàng <strong>Hupunacake</strong>, tự động đồng bộ cho khách hàng trên <strong>Botcake</strong></>}
          >
            <Switch checked={settings.botcakeSync} onCheckedChange={(v) => set("botcakeSync", v)} />
          </SettingRow>
        </div>
      </SettingCard>
    </div>
  );
}

