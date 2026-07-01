"use client";

import React, { useState, useEffect } from "react";
import { MessageSquarePlus, Trash2, Edit2, Upload, Download, ArrowDownUp, Settings, Plus, Search, Image as ImageIcon, Paperclip, StickyNote, Shirt, Code, MapPin, GripVertical, MessageCircle, LayoutTemplate, UserCog, Frown } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { SettingCard } from "@/components/ui/SettingCard";
import { SettingRow } from "@/components/ui/SettingRow";
import { SettingPageHeader } from "@/components/ui/SettingPageHeader";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { useAppContext } from "@/contexts/AppContext";
import { notification, Modal } from "antd";

export default function QuickRepliesPage() {
  const { 
    workspaceSettings, 
    updateWorkspaceSettings, 
    quickReplies, 
    refreshQuickReplies,
    quickReplyTopics,
    refreshQuickReplyTopics
  } = useAppContext();
  
  const [settings, setSettings] = useState({
    suggestQuickReply: true,
    sendImmediately: false,
    enableTopics: false,
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newShortcut, setNewShortcut] = useState("");
  const [newText, setNewText] = useState("");
  const [newTopicId, setNewTopicId] = useState("");

  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicColor, setNewTopicColor] = useState("#1890ff");

  useEffect(() => {
    if (workspaceSettings?.quickReplySettings) {
      setSettings(workspaceSettings.quickReplySettings);
    }
  }, [workspaceSettings?.quickReplySettings]);

  const setSetting = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    updateWorkspaceSettings({
      quickReplySettings: {
        ...settings,
        [key]: value
      }
    });
  };

  const handleAddSubmit = async () => {
    if (!newText.trim()) return;
    
    let finalShortcut = newShortcut.trim();
    if (!finalShortcut) {
      finalShortcut = `/qr-${Date.now().toString().slice(-4)}`;
    } else if (!finalShortcut.startsWith("/")) {
      finalShortcut = "/" + finalShortcut;
    }

    try {
      const res = await fetch('/api/quick_replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortcut: finalShortcut, text: newText, topicId: newTopicId })
      });
      const json = await res.json();
      if (json.success) {
        notification.success({ message: "Đã lưu câu trả lời nhanh" });
        setIsAdding(false);
        setNewShortcut("");
        setNewText("");
        setNewTopicId("");
        refreshQuickReplies();
      } else {
        notification.error({ message: "Lỗi", description: json.error || "Không thể thêm" });
      }
    } catch (e: any) {
      console.error(e);
      notification.error({ message: "Lỗi", description: e.message || "Lỗi hệ thống" });
    }
  };

  const handleSaveTopic = async () => {
    if (!newTopicName.trim()) return;
    try {
      const res = await fetch('/api/quick_reply_topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTopicName, color: newTopicColor })
      });
      const json = await res.json();
      if (json.success) {
        notification.success({ message: "Đã lưu chủ đề" });
        setIsAddingTopic(false);
        setNewTopicName("");
        refreshQuickReplyTopics();
      }
    } catch (e) {
      notification.error({ message: "Có lỗi xảy ra" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/quick_replies?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        refreshQuickReplies();
        notification.success({ message: "Đã xoá mẫu câu" });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto py-8 px-8 flex flex-col gap-6">
      <SettingPageHeader title="Hỗ trợ trả lời" />

      {/* Trả lời nhanh */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-end border-b border-gray-100 pb-2 mb-6">
          <div className="flex h-full">
            <div className="text-[#0d6efd] border-b-[2.5px] border-[#0d6efd] pb-2 -mb-[9.5px] px-2 text-[15px] font-semibold">
              Trả lời nhanh
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            <IconButton icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>} />
            <IconButton title="Nhập dữ liệu" icon={<Upload size={15} strokeWidth={2.5} />} />
            <IconButton title="Xuất dữ liệu" icon={<Download size={15} strokeWidth={2.5} />} />
            <IconButton icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>} />
            <button 
              className="h-8 px-4 flex items-center justify-center bg-[#0d6efd] hover:bg-blue-600 rounded text-white font-medium text-[13px] transition ml-2"
              onClick={() => setIsAdding(true)}
            >
              Thêm mẫu
            </button>
          </div>
        </div>

        <div className="border border-gray-100 rounded-md overflow-hidden bg-white min-h-[500px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-gray-100 text-gray-700 font-medium">
              <tr>
                <th className="py-3 px-4 w-16 text-center border-r border-gray-100 font-semibold text-[13px]">STT</th>
                <th className="py-3 px-4 w-40 border-r border-gray-100 font-semibold text-[13px]">Ký tự tắt</th>
                <th className="py-3 px-4 font-semibold text-[13px]">Tin nhắn</th>
                <th className="py-3 px-4 w-16 text-right">
                  <div className="flex justify-end">
                    <div className="bg-[#f0f2f5] p-1.5 rounded cursor-pointer hover:bg-gray-200 transition">
                      <Search size={15} strokeWidth={2.5} className="text-gray-500" />
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {quickReplies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquarePlus size={32} className="text-gray-300 opacity-50" />
                      <span>Không có dữ liệu</span>
                    </div>
                  </td>
                </tr>
              ) : (
                quickReplies.map((item, index) => {
                      const topic = quickReplyTopics.find(t => t.id === item.topicId);
                      return (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                          <td className="py-4 px-4 text-center text-gray-500">{index + 1}</td>
                          <td className="py-4 px-4 font-semibold text-blue-600 cursor-pointer hover:underline">{item.shortcut}</td>
                          <td className="py-4 px-4 text-gray-700">
                            <div>{item.text}</div>
                            {settings.enableTopics && topic && (
                              <div className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[11px] font-medium border" style={{ backgroundColor: `${topic.color}15`, color: topic.color, borderColor: `${topic.color}30` }}>
                                {topic.name}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <div className="text-gray-400 hover:text-gray-600 cursor-pointer"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></div>
                              <div className="text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => handleDelete(item.id)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Chức năng & công cụ */}
        <SettingCard title={<span className="text-[15px] font-semibold text-[#1e293b]">Chức năng & công cụ</span>}>
          <div className="space-y-0">
            <SettingRow
              icon={<MessageCircle size={20} className="text-gray-600" />}
              title={<span className="font-semibold text-gray-800">Gợi ý mẫu trả lời nhanh</span>}
              description={
                <span className="text-[13px] text-gray-500">
                  Khi nhập / + &lt;Nội dung ký tự tắt&gt; (ví dụ: /Pancake), hệ thống sẽ gợi ý câu trả lời nhanh mà bạn đã cài đặt
                </span>
              }
            >
              <Switch checked={settings.suggestQuickReply} onCheckedChange={(v) => setSetting("suggestQuickReply", v)} />
            </SettingRow>

            <SettingRow
              icon={<div className="w-[20px]" />}
              description={
                <span className="text-[14px] text-gray-700">
                  Gửi ngay mẫu trả lời nhanh khi chọn từ mục gợi ý
                </span>
              }
            >
              <Switch checked={settings.sendImmediately} onCheckedChange={(v) => setSetting("sendImmediately", v)} />
            </SettingRow>

            <SettingRow
              divider
              icon={<LayoutTemplate size={20} className="text-gray-600" />}
              title={<span className="font-semibold text-gray-800">Chủ đề câu trả lời nhanh</span>}
              description={
                <span className="text-[13px] text-gray-500">
                  Cài đặt chủ đề cho các câu trả lời nhanh của bạn để dễ dàng phân biệt các nhóm câu.
                </span>
              }
            >
              <Switch checked={settings.enableTopics} onCheckedChange={(v) => setSetting("enableTopics", v)} />
            </SettingRow>

            <SettingRow
              divider
              icon={<UserCog size={20} className="text-gray-600" />}
              title={<span className="font-semibold text-gray-800">Cài đặt thông tin nhân viên</span>}
              description={
                <span className="text-[13px] text-gray-500 mt-1 block">
                  Cài đặt thông tin chi tiết nhân viên trả lời để chèn vào trong nội dung câu trả lời nhanh theo biến #{"{STAFF_DETAILS}"}
                </span>
              }
            >
              <span className="text-blue-600 font-semibold text-[13px] cursor-pointer hover:underline mt-1 block">
                Cài đặt
              </span>
            </SettingRow>
          </div>
        </SettingCard>

        {/* Chủ đề câu trả lời nhanh */}
        <SettingCard title={
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold text-[#1e293b] mb-1">Chủ đề câu trả lời nhanh</span>
            <span className="text-[12px] text-gray-500 font-normal">Chủ đề cho mẫu câu trả lời nhanh</span>
          </div>
        }>
          <div className="flex gap-2 mb-4">
            <SearchInput
              width={300}
              placeholder="Tìm kiếm chủ đề"
              disabled={!settings.enableTopics}
              className={`bg-gray-50/50 ${!settings.enableTopics ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
            />
            <IconButton
              icon={<Plus size={16} strokeWidth={2.5} />}
              disabled={!settings.enableTopics}
              onClick={() => setIsAddingTopic(true)}
            />
          </div>
          
          <div className="border border-gray-200 rounded-md overflow-hidden bg-white min-h-[300px] flex flex-col">
            <table className="w-full text-left text-sm border-b border-gray-200">
              <thead className="bg-white text-gray-700">
                <tr>
                  <th className="py-2.5 px-4 w-12 font-medium text-[13px] border-r border-gray-200">
                    <ArrowDownUp size={14} className="text-gray-400 mx-auto" />
                  </th>
                  <th className="py-2.5 px-4 border-r border-gray-200 font-semibold text-[13px] text-center w-[45%]">
                    Tên chủ đề
                  </th>
                  <th className="py-2.5 px-4 font-semibold text-[13px] text-center">
                    Màu chủ đề
                  </th>
                </tr>
              </thead>
            </table>
            
            <div className="flex-1 flex flex-col bg-white overflow-hidden rounded-b-md">
              {!settings.enableTopics ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[250px]">
                  <div className="relative mb-6 flex items-center justify-center w-24 h-24">
                    <div className="absolute bg-[#e2e8f0] rounded-full w-20 h-20 -right-2 top-0 opacity-60"></div>
                    <div className="absolute bg-[#cbd5e1] rounded-full w-20 h-20 -left-2 bottom-0 flex items-center justify-center">
                      <Frown size={28} className="text-white" />
                    </div>
                  </div>
                  <span className="text-[15px] font-semibold text-gray-800 mb-1.5">Bạn chưa bật chức năng này</span>
                  <span className="text-[13px] text-gray-500 text-center max-w-[280px] leading-relaxed">
                    Hãy bật chức năng <strong>Chủ đề câu trả lời nhanh</strong> ở bên trái để thêm chủ đề mẫu câu nhé
                  </span>
                </div>
              ) : quickReplyTopics.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[250px]">
                  <MessageSquarePlus size={36} className="text-gray-300 mb-3" />
                  <span className="text-sm font-medium text-gray-500">Chưa có chủ đề</span>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto w-full">
                  <table className="w-full text-left text-[13px]">
                    <tbody>
                      {quickReplyTopics.map((topic, idx) => (
                        <tr key={topic.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 w-12 text-center text-gray-400 border-r border-gray-100">{idx + 1}</td>
                          <td className="py-3 px-4 font-medium text-gray-800 border-r border-gray-100 w-[45%]">{topic.name}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="w-5 h-5 rounded-sm mx-auto" style={{ backgroundColor: topic.color }}></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </SettingCard>
      </div>
      <Modal
        title={<div className="text-[16px] font-bold pb-2 border-b mb-4">Thêm câu trả lời nhanh</div>}
        open={isAdding}
        onCancel={() => setIsAdding(false)}
        footer={null}
        width={650}
        centered
        closeIcon={<span className="text-gray-500 text-lg hover:text-gray-800">✕</span>}
        className="!p-0"
        styles={{ container: { padding: '24px' } }}
      >
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-600 font-medium mb-1">Ký tự tắt</label>
            <div className="flex w-full border rounded text-sm overflow-hidden focus-within:border-blue-500 transition-colors">
              <div className="bg-gray-100 px-3 py-2 text-gray-500 border-r flex items-center justify-center">
                /
              </div>
              <input 
                type="text" 
                placeholder="Nhập kí tự" 
                className="flex-1 px-3 py-2 outline-none text-[13px]"
                value={newShortcut}
                onChange={e => setNewShortcut(e.target.value)}
              />
            </div>
          </div>

          {settings.enableTopics && (
            <div className="flex flex-col gap-1">
              <label className="text-[13px] text-gray-600 font-medium mb-1">Chủ đề</label>
              <select 
                className="w-full border border-gray-200 rounded px-3 py-2 text-[13px] text-gray-700 outline-none focus:border-blue-500 bg-white"
                value={newTopicId}
                onChange={e => setNewTopicId(e.target.value)}
              >
                <option value="">-- Không chọn chủ đề --</option>
                {quickReplyTopics.map(topic => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-[#f3f4f6] p-4 rounded-lg flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
              <GripVertical size={14} className="text-gray-400 cursor-grab" /> Nội dung 1
            </div>
            <div className="bg-white border border-blue-400 rounded p-3 min-h-[140px] flex flex-col justify-between focus-within:ring-2 ring-blue-100 transition-shadow">
              <textarea 
                placeholder="Nhập nội dung" 
                className="w-full text-[13px] outline-none resize-none flex-1 bg-transparent"
                rows={4}
                value={newText}
                onChange={e => setNewText(e.target.value)}
              ></textarea>
              <div className="flex gap-4 mt-3 text-gray-300">
                <ImageIcon size={18} className="hover:text-gray-500 cursor-pointer transition-colors" />
                <Paperclip size={18} className="hover:text-gray-500 cursor-pointer transition-colors" />
                <StickyNote size={18} className="hover:text-gray-500 cursor-pointer transition-colors" />
                <Shirt size={18} className="hover:text-gray-500 cursor-pointer transition-colors" />
                <Code size={18} className="hover:text-gray-500 cursor-pointer transition-colors" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-1">
            <button className="border border-dashed border-blue-200 text-blue-600 px-4 py-1.5 rounded flex items-center gap-2 text-[13px] font-medium hover:bg-blue-50 transition-colors">
              <Plus size={14} /> Thêm nội dung
            </button>
            <button className="border border-dashed border-blue-200 text-blue-600 px-4 py-1.5 rounded flex items-center gap-2 text-[13px] font-medium hover:bg-blue-50 transition-colors">
              <MapPin size={14} /> Thêm yêu cầu địa chỉ
            </button>
          </div>

          <div className="flex items-center justify-between mt-8 pt-4">
            <div className="text-[12px] text-gray-500 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center text-[10px] font-bold opacity-70">?</span>
              Bạn có thể thêm tối đa 10 nội dung và 120 hình ảnh
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAdding(false)} 
                className="px-5 py-1.5 bg-[#f0f2f5] hover:bg-gray-200 text-[#0d6efd] rounded text-[13px] font-semibold transition"
              >
                Đóng
              </button>
              <button 
                onClick={handleAddSubmit} 
                disabled={!newText.trim()}
                className={`px-5 py-1.5 rounded text-[13px] font-semibold transition duration-200 ${
                  !newText.trim() 
                    ? 'bg-[#849bbd] text-white cursor-not-allowed opacity-90' 
                    : 'bg-[#5b7392] hover:bg-[#4a5e78] text-white'
                }`}
              >
                Lưu mẫu
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        title={<div className="text-[16px] font-bold pb-2 border-b mb-4">Thêm chủ đề</div>}
        open={isAddingTopic}
        onCancel={() => setIsAddingTopic(false)}
        footer={null}
        width={400}
        centered
        closeIcon={<span className="text-gray-500 text-lg hover:text-gray-800">✕</span>}
        className="!p-0"
        styles={{ container: { padding: '24px' } }}
      >
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-600 font-medium mb-1">Tên chủ đề</label>
            <input 
              type="text" 
              placeholder="Nhập tên chủ đề" 
              className="w-full border border-gray-200 rounded px-3 py-2 outline-none text-[13px] focus:border-blue-500 transition-colors"
              value={newTopicName}
              onChange={e => setNewTopicName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] text-gray-600 font-medium mb-1">Màu sắc</label>
            <div className="flex gap-2">
              {["#1890ff", "#52c41a", "#faad14", "#f5222d", "#722ed1", "#eb2f96"].map(color => (
                <div 
                  key={color}
                  className={`w-8 h-8 rounded cursor-pointer border-2 ${newTopicColor === color ? 'border-gray-800' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewTopicColor(color)}
                ></div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <button 
              className="px-4 py-2 rounded font-medium text-[13px] bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              onClick={() => setIsAddingTopic(false)}
            >
              Hủy
            </button>
            <button 
              className="px-4 py-2 rounded font-medium text-[13px] bg-blue-600 text-white hover:bg-blue-700 transition"
              onClick={handleSaveTopic}
            >
              Lưu chủ đề
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
