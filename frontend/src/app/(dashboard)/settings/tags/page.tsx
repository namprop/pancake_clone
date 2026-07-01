"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tag as TagIcon, Type, Layers, UserCog, Phone, CheckCheck, Copy, HelpCircle, Edit, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { Select } from "@/components/ui/Select";
import { SettingCard } from "@/components/ui/SettingCard";
import { SettingRow } from "@/components/ui/SettingRow";
import { SettingPageHeader } from "@/components/ui/SettingPageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Table, Button, Tabs, Modal, Form, Input, Popconfirm, message, Checkbox } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAppContext } from "@/contexts/AppContext";

// A dummy workspace ID for demo purposes
const DUMMY_WORKSPACE_ID = "65a123456789012345678901";

const PRESET_COLORS = [
  "#3b82f6", "#f97316", "#f59e0b", "#14b8a6", "#0ea5e9", 
  "#6366f1", "#a855f7", "#eab308", "#22c55e"
];

export default function TagsSettingsPage() {
  const { workspaceSettings, updateWorkspaceSettings } = useAppContext();
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [activeColor, setActiveColor] = useState("#3b82f6");
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [form] = Form.useForm();

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/settings/tags?workspaceId=${DUMMY_WORKSPACE_ID}`);
      const json = await res.json();
      if (json.success) setTags(json.data);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải danh sách thẻ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAddTag = () => {
    setEditingTag(null);
    setActiveColor("#3b82f6");
    form.resetFields();
    form.setFieldsValue({ color: "#3b82f6", order: tags.length + 1, isInactive: false });
    setIsModalOpen(true);
  };

  const handleEditTag = (record: any) => {
    setEditingTag(record);
    setActiveColor(record.color);
    form.setFieldsValue({ 
      name: record.name, 
      color: record.color,
      order: record.order || 0,
      description: record.description || "",
      isInactive: record.isInactive || false
    });
    setIsModalOpen(true);
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const res = await fetch(`/api/settings/tags/${id}`, { method: "DELETE" });
      if (res.ok) {
        message.success("Đã xoá thẻ thành công");
        fetchTags();
      } else {
        message.error("Lỗi khi xoá thẻ");
      }
    } catch (err) {
      message.error("Lỗi khi xoá thẻ");
    }
  };

  const handleSaveTag = async (values: any) => {
    try {
      const method = editingTag ? "PUT" : "POST";
      const url = editingTag ? `/api/settings/tags/${editingTag._id}` : "/api/settings/tags";
      
      const payload = { 
        ...values, 
        order: Number(values.order) || 0,
        workspaceId: DUMMY_WORKSPACE_ID 
      };
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        message.success(editingTag ? "Đã cập nhật thẻ" : "Đã thêm thẻ mới");
        setIsModalOpen(false);
        fetchTags();
      } else {
        const errorData = await res.json().catch(() => ({}));
        message.error(errorData.error || "Có lỗi xảy ra khi lưu");
        console.error("Save tag error:", errorData);
      }
    } catch (err) {
      message.error("Có lỗi xảy ra");
    }
  };

  const tagColumns: ColumnsType<any> = [
    {
      title: "STT",
      key: "index",
      width: 60,
      align: "center",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tên thẻ",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <div className="flex items-center gap-3">
          <TagIcon className={`w-4 h-4 ${record.color?.includes('bg-') ? record.color.replace("bg-", "text-") : ""}`} style={{ color: record.color?.includes('#') ? record.color : undefined, fill: "currentColor" }} />
          <span className="text-[13px] text-gray-700">{name}</span>
        </div>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
      render: (color: string) => (
        <div 
          className={`w-[60px] h-[16px] rounded-full shadow-sm ${color?.includes('bg-') ? color : ''}`} 
          style={{ backgroundColor: color?.includes('#') ? color : undefined }}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center",
      render: (_: any, record: any) => (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => handleEditTag(record)} className="text-gray-400 hover:text-blue-500 transition">
            <Edit className="w-4 h-4" />
          </button>
          <Popconfirm
            title="Xóa thẻ"
            description="Bạn có chắc chắn muốn xóa thẻ này không?"
            onConfirm={() => handleDeleteTag(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <button className="text-gray-400 hover:text-red-500 transition">
              <Trash2 className="w-4 h-4" />
            </button>
          </Popconfirm>
        </div>
      ),
    }
  ];

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-8">
      <SettingPageHeader title="Thẻ hội thoại" />

      <div className="flex gap-6 items-stretch">
        {/* Left: Chức năng & công cụ */}
        <div className="w-[380px] shrink-0">
          <SettingCard title="Chức năng &amp; công cụ">
            <div className="space-y-6">
              <SettingRow
                icon={<TagIcon />}
                title="Gắn nhiều thẻ cho mỗi hội thoại"
                description="Hội thoại sẽ có thể gắn được nhiều thẻ khi bật tuỳ chọn này."
              >
                <Switch 
                  checked={workspaceSettings.tagSettings.allowMultiple} 
                  onCheckedChange={(checked) => updateWorkspaceSettings({ tagSettings: { ...workspaceSettings.tagSettings, allowMultiple: checked } })} 
                />
              </SettingRow>

              <SettingRow
                divider
                icon={<Type />}
                title={<span className="flex items-center gap-1.5">Hiển thị đầy đủ tên thẻ <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></span>}
                description="Hiển thị đầy đủ tên thẻ ở danh sách hội thoại"
              >
                <Switch 
                  checked={workspaceSettings.tagSettings.showFullName} 
                  onCheckedChange={(checked) => updateWorkspaceSettings({ tagSettings: { ...workspaceSettings.tagSettings, showFullName: checked } })} 
                />
              </SettingRow>

              <SettingRow
                divider
                icon={<Layers />}
                title={<span className="flex items-center gap-1.5">Chế độ lọc đồng thời nhiều thẻ <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></span>}
                description="Lọc đồng thời nhiều thẻ theo điều kiện OR (A hoặc B) và AND (A và B)"
              >
                <Select
                  value={workspaceSettings.tagSettings.filterMode}
                  onChange={(value) => updateWorkspaceSettings({ tagSettings: { ...workspaceSettings.tagSettings, filterMode: value } })}
                  style={{ width: 80 }}
                  options={[
                    { value: "AND", label: "AND" },
                    { value: "OR", label: "OR" },
                  ]}
                />
              </SettingRow>

              <SettingRow
                divider
                icon={<UserCog />}
                title={<span className="flex items-center gap-1.5">Đồng bộ thẻ theo khách hàng <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></span>}
                description="Khi gắn thẻ hội thoại, đồng thời gắn thẻ đó cho tất cả hội thoại khác của cùng khách hàng."
              >
                <Switch 
                  checked={workspaceSettings.tagSettings.syncByCustomer} 
                  onCheckedChange={(checked) => updateWorkspaceSettings({ tagSettings: { ...workspaceSettings.tagSettings, syncByCustomer: checked } })} 
                />
              </SettingRow>

              <SettingRow
                divider
                icon={<Phone />}
                title={<span className="flex items-center gap-1.5">Thẻ tổng đài <HelpCircle className="w-3.5 h-3.5 text-gray-400" /></span>}
              >
                <div className="space-y-3 pt-2">
                  <div>
                    <p className="text-[13px] text-gray-600 mb-2">Gắn thẻ hội thoại khi gọi thành công</p>
                    <Select 
                      placeholder="Chọn thẻ" 
                      value={workspaceSettings.tagSettings.callCenter?.successTagId || undefined}
                      onChange={(val) => updateWorkspaceSettings({ tagSettings: { ...workspaceSettings.tagSettings, callCenter: { ...workspaceSettings.tagSettings.callCenter, successTagId: val } } })}
                      options={tags.map(t => ({ value: t._id || t.id, label: t.name }))} 
                      style={{ width: "100%" }} 
                    />
                  </div>
                  <div>
                    <p className="text-[13px] text-gray-600 mb-2">Gắn thẻ hội thoại khi gọi không nghe máy</p>
                    <Select 
                      placeholder="Chọn thẻ" 
                      value={workspaceSettings.tagSettings.callCenter?.failTagId || undefined}
                      onChange={(val) => updateWorkspaceSettings({ tagSettings: { ...workspaceSettings.tagSettings, callCenter: { ...workspaceSettings.tagSettings.callCenter, failTagId: val } } })}
                      options={tags.map(t => ({ value: t._id || t.id, label: t.name }))} 
                      style={{ width: "100%" }} 
                    />
                  </div>
                </div>
              </SettingRow>
            </div>
          </SettingCard>
        </div>

        {/* Right: Danh sách thẻ */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-w-[500px]">
          <div className="p-6 pb-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-[15px]">Thẻ hội thoại</h3>
              <HelpCircle className="w-[14px] h-[14px] text-gray-400 cursor-pointer" />
              <span className="bg-[#e6f2ff] text-blue-600 text-[11px] font-bold px-2 py-0.5 rounded-full ml-1">
                {tags.length} Thẻ
              </span>
            </div>
            <p className="text-[13px] text-gray-500 mb-4">Sử dụng thẻ hội thoại giúp phân biệt các hội thoại hoặc khách hàng</p>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                { key: "list", label: "Danh sách thẻ" },
                { key: "inactive", label: "Thẻ ngưng sử dụng" },
              ]}
            />
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-4">
              <SearchInput placeholder="Tìm kiếm thẻ" width={240} />
              <div className="flex items-center gap-2">
                <button className="w-[36px] h-[36px] flex items-center justify-center bg-[#f0f2f5] rounded hover:bg-gray-200 transition text-gray-500">
                  <CheckCheck className="w-[18px] h-[18px]" />
                </button>
                {activeTab === "list" && (
                  <>
                    <button className="w-[36px] h-[36px] flex items-center justify-center bg-[#f0f2f5] rounded hover:bg-gray-200 transition text-gray-500">
                      <Copy className="w-4 h-4" />
                    </button>
                    <Button type="primary" style={{ backgroundColor: "#0052cc" }} onClick={handleAddTag}>
                      Thêm thẻ
                    </Button>
                  </>
                )}
              </div>
            </div>

            <Table
              columns={tagColumns}
              dataSource={tags.filter(t => activeTab === "inactive" ? t.isInactive : !t.isInactive)}
              rowKey="_id"
              size="small"
              pagination={false}
              bordered
              loading={loading}
              locale={{ emptyText: "Chưa có thẻ nào" }}
            />
          </div>
        </div>
      </div>

      {/* Modal Thêm/Sửa Thẻ */}
      <Modal
        title={<span className="text-[16px] font-bold text-slate-800">{editingTag ? "Chỉnh sửa thẻ" : "Thêm mới thẻ"}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        closeIcon={<span className="text-gray-500 font-bold text-lg">✕</span>}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: "#f0f2f5", color: "#334155", border: "none" }} className="font-medium">
            Đóng
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()} style={{ backgroundColor: "#1677ff" }} className="font-medium">
            {editingTag ? "Lưu thay đổi" : "Thêm thẻ"}
          </Button>,
        ]}
      >
        <div className="pt-2">
          <Form form={form} layout="vertical" onFinish={handleSaveTag}>
            <Form.Item
              name="order"
              label={<span className="text-[13px] text-gray-700 font-medium">Số thứ tự</span>}
              className="mb-4"
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              name="name"
              label={<span className="text-[13px] text-gray-700 font-medium">Tên thẻ</span>}
              rules={[{ required: true, message: "Vui lòng nhập tên thẻ" }]}
              className="mb-4"
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="color"
              label={<span className="text-[13px] text-gray-700 font-medium">Bộ chọn màu</span>}
              className="mb-4"
            >
              <div className="flex flex-wrap gap-2.5 mt-1">
                <input 
                  type="color" 
                  ref={colorInputRef} 
                  className="w-0 h-0 opacity-0 absolute pointer-events-none" 
                  value={activeColor?.startsWith('#') ? activeColor : '#3b82f6'} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setActiveColor(val);
                    form.setFieldsValue({ color: val });
                  }}
                />
                {(() => {
                  const isPreset = PRESET_COLORS.includes(activeColor);
                  return (
                    <div 
                      onClick={() => colorInputRef.current?.click()}
                      style={{ backgroundColor: !isPreset ? activeColor : undefined }}
                      className={`w-[32px] h-[32px] rounded-lg flex items-center justify-center cursor-pointer hover:opacity-85 transition ${
                        !isPreset ? "shadow-md scale-105" : "bg-[#f0f2f5] hover:bg-gray-200"
                      }`}
                      title="Chọn màu tùy chỉnh"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={!isPreset ? "#ffffff" : "#475569"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/></svg>
                    </div>
                  );
                })()}
                {PRESET_COLORS.map(c => (
                  <div 
                    key={c}
                    onClick={() => {
                      setActiveColor(c);
                      form.setFieldsValue({ color: c });
                    }}
                    className={`w-[32px] h-[32px] rounded-lg cursor-pointer transition-all flex items-center justify-center hover:opacity-80`}
                    style={{ backgroundColor: c }}
                  >
                    {activeColor === c && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                  </div>
                ))}
              </div>
            </Form.Item>

            <div className="mb-4">
              <div className="text-[13px] text-gray-700 font-medium mb-2">Màu chủ đề sẽ được hiển thị</div>
              <Form.Item dependencies={['name', 'color']} noStyle>
                {() => {
                  const name = form.getFieldValue("name") || "Tên thẻ";
                  const color = activeColor;
                  return (
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-white text-[13px] font-medium" style={{ backgroundColor: color }}>
                      {name}
                    </div>
                  )
                }}
              </Form.Item>
            </div>

            <Form.Item
              name="description"
              label={<span className="text-[13px] text-gray-700 font-medium">Mô tả thẻ</span>}
              className="mb-4"
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item name="isInactive" valuePropName="checked" className="mb-0">
              <Checkbox className="flex items-start">
                <div className="ml-1 -mt-0.5">
                  <div className="text-[14px] text-slate-800">Ngưng sử dụng thẻ này</div>
                  <div className="text-[13px] text-slate-500 mt-0.5 leading-snug">
                    Các thẻ ngừng sử dụng bị ẩn đi, sẽ được hiển thị ở cuối danh sách gắn thẻ tại <a href="#" className="text-blue-600 hover:underline" onClick={e => e.stopPropagation()}>Hội thoại</a>
                  </div>
                </div>
              </Checkbox>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
