"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Customer,
  Product,
  OrderItem,
  Order,
} from "@/types";
import {
  PROVINCES,
  DISTRICTS,
  WARDS,
  PRODUCTS,
} from "@/data/mockData";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Truck,
  QrCode,
  CheckCircle,
  DollarSign,
  MapPin,
  User,
  Phone,
  FileText,
  Layers,
  Copy,
  Check,
  List,
  Tag as TagIcon,
  Edit2,
  ImageIcon,
  Pin,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";

import { useOrderCreator } from "@/hooks/useOrderCreator";

interface OrderCreatorProps {
  customer: Customer | undefined;
  onCreateOrder: (order: Order) => void;
  onUpdateCustomerDetails?: (customerId: string, fields: Partial<Customer>) => void;
  orders?: Order[];
  onClose?: () => void;
}

interface CustomerNoteItem {
  id: string;
  text: string;
  imageUrl?: string;
  imageName?: string;
  pinned?: boolean;
  authorName?: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt?: string;
}

const NOTE_AUTHOR_NAME = "Phạm Tiến Nam";
const NOTE_AUTHOR_AVATAR = `https://ui-avatars.com/api/?name=${encodeURIComponent(NOTE_AUTHOR_NAME)}&background=e5e7eb&color=94a3b8`;
const NOTE_SECTION_MIN_HEIGHT = 150;
const NOTE_SECTION_DEFAULT_HEIGHT = 217;
const NOTE_SECTION_MAX_HEIGHT = 300;

function parseCustomerNotes(raw?: string): CustomerNoteItem[] {
  if (!raw?.trim()) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((note) => note && typeof note === "object")
        .map((note, index) => ({
          id: String(note.id || `note-${index}`),
          text: String(note.text || ""),
          imageUrl: note.imageUrl ? String(note.imageUrl) : undefined,
          imageName: note.imageName ? String(note.imageName) : undefined,
          pinned: Boolean(note.pinned),
          authorName: note.authorName ? String(note.authorName) : NOTE_AUTHOR_NAME,
          authorAvatar: note.authorAvatar ? String(note.authorAvatar) : NOTE_AUTHOR_AVATAR,
          createdAt: String(note.createdAt || new Date().toISOString()),
          updatedAt: note.updatedAt ? String(note.updatedAt) : undefined,
        }))
        .filter((note) => note.text.trim() || note.imageUrl);
    }
  } catch {
  }

  return raw
    .split("\n")
    .map((note) => note.trim())
    .filter(Boolean)
    .map((text, index) => ({
      id: `legacy-note-${index}`,
      text,
      authorName: NOTE_AUTHOR_NAME,
      authorAvatar: NOTE_AUTHOR_AVATAR,
      createdAt: new Date().toISOString(),
    }));
}

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatNoteTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  if (isSameCalendarDay(date, new Date())) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).replace("/", "-");
}

export default function OrderCreator({
  customer,
  onCreateOrder,
  onUpdateCustomerDetails,
  orders = [],
  onClose,
}: OrderCreatorProps) {
  const {
    customerName, setCustomerName,
    phone, setPhone,
    address, setAddress,
    provinceCode, setProvinceCode,
    districtCode, setDistrictCode,
    wardCode, setWardCode,
    cartItems, setCartItems,
    shippingFee, setShippingFee,
    discount, setDiscount,
    carrier, setCarrier,
    paymentMethod, setPaymentMethod,
    customerNote, setCustomerNote,
    deliveryNote, setDeliveryNote,
    statusMessage, setStatusMessage,
    activeTab, setActiveTab,
    copiedText, setCopiedText,
    availableDistricts, availableWards,
    addProductToCart, updateQuantity, removeItem,
    subTotal, total,
    handleSubmitOrder, copyBankDetails
  } = useOrderCreator(customer, onCreateOrder);
  const [noteDraft, setNoteDraft] = useState("");
  const [draftImage, setDraftImage] = useState<{ url: string; name: string } | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingImage, setEditingImage] = useState<{ url?: string; name?: string }>({});
  const [uploadTarget, setUploadTarget] = useState<"draft" | "edit">("draft");
  const [noteSectionHeight, setNoteSectionHeight] = useState(NOTE_SECTION_DEFAULT_HEIGHT);
  const noteFileInputRef = useRef<HTMLInputElement>(null);
  const customerNotes = parseCustomerNotes(customer?.notes).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const saveNotes = (notes: CustomerNoteItem[]) => {
    if (!customer) return;
    onUpdateCustomerDetails?.(customer.id, { notes: JSON.stringify(notes) });
  };

  useEffect(() => {
    setNoteDraft("");
    setDraftImage(null);
    setEditingNoteId(null);
    setEditingText("");
    setEditingImage({});
  }, [customer?.id]);

  const handleSubmitNote = () => {
    const note = noteDraft.trim();
    if (!customer || (!note && !draftImage)) return;

    saveNotes([
      {
        id: `note-${Date.now()}`,
        text: note,
        imageUrl: draftImage?.url,
        imageName: draftImage?.name,
        pinned: false,
        authorName: NOTE_AUTHOR_NAME,
        authorAvatar: NOTE_AUTHOR_AVATAR,
        createdAt: new Date().toISOString(),
      },
      ...customerNotes,
    ]);
    setNoteDraft("");
    setDraftImage(null);
  };

  const handleEditNote = (note: CustomerNoteItem) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
    setEditingImage({ url: note.imageUrl, name: note.imageName });
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setEditingText("");
    setEditingImage({});
  };

  const handleSaveEditedNote = () => {
    const text = editingText.trim();
    if (!editingNoteId || (!text && !editingImage.url)) return;

    saveNotes(
      customerNotes.map((note) =>
        note.id === editingNoteId
          ? {
            ...note,
            text,
            imageUrl: editingImage.url,
            imageName: editingImage.name,
            updatedAt: new Date().toISOString(),
          }
          : note
      )
    );
    handleCancelEditNote();
  };

  const handleDeleteNote = (noteId: string) => {
    saveNotes(customerNotes.filter((note) => note.id !== noteId));
  };

  const handleTogglePinNote = (noteId: string) => {
    saveNotes(
      customerNotes.map((note) =>
        note.id === noteId ? { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() } : note
      )
    );
  };

  const handlePickImage = (target: "draft" | "edit") => {
    setUploadTarget(target);
    noteFileInputRef.current?.click();
  };

  const handleNoteImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    if (!json.success || !json.data?.url) return;

    const image = { url: json.data.url as string, name: (json.data.name as string) || file.name };
    if (uploadTarget === "edit") {
      setEditingImage(image);
    } else {
      setDraftImage(image);
    }
  };

  const handleResizeNotes = (event: React.PointerEvent<HTMLDivElement>) => {
    const startY = event.clientY;
    const startHeight = noteSectionHeight;
    const target = event.currentTarget;
    let animationFrameId = 0;

    target.setPointerCapture(event.pointerId);

    const handleMove = (moveEvent: PointerEvent) => {
      const nextHeight = Math.min(
        NOTE_SECTION_MAX_HEIGHT,
        Math.max(NOTE_SECTION_MIN_HEIGHT, startHeight + moveEvent.clientY - startY)
      );

      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = window.requestAnimationFrame(() => {
        setNoteSectionHeight(nextHeight);
      });
    };

    const handleUp = () => {
      window.cancelAnimationFrame(animationFrameId);
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  return (
    <div className="w-full md:w-[360px] lg:w-[410px] bg-[#f0f2f5] border-l border-gray-200 flex flex-col h-full shrink-0 select-none shadow-sm z-10">
      {/* Tab Select Header */}
      <div className="flex bg-white shrink-0 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`relative flex-1 py-3 text-center text-sm font-semibold transition ${activeTab === "info"
            ? "text-blue-600"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
        >
          Thông tin
          {activeTab === "info" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-blue-600" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("create")}
          className={`relative flex-1 py-3 text-center text-sm font-semibold transition ${activeTab === "create"
            ? "text-blue-600"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
        >
          Tạo đơn
          {activeTab === "create" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-blue-600" />
          )}
        </button>
      </div>

      {activeTab === "info" ? (
        <div className="flex-1 overflow-hidden bg-white flex flex-col items-center">
          <div className="w-full shrink-0 overflow-hidden flex flex-col bg-white" style={{ height: noteSectionHeight }}>
            <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain pt-4">
              {/* Note Empty State */}
              <div className={`flex flex-col items-center justify-center w-full pb-6 ${customerNotes.length === 0 ? "" : "hidden"}`}>
                <div className="w-24 h-24 mb-3 relative flex items-center justify-center">
                  {/* Fake SVG matching the note illustration */}
                  <svg width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="30" fill="#f0f2f5" />
                    <path d="M40 25h20a5 5 0 0 1 5 5v40a5 5 0 0 1-5 5H40a5 5 0 0 1-5-5V30a5 5 0 0 1 5-5z" fill="#fff" stroke="#e2e8f0" strokeWidth="2" />
                    <path d="M45 35h10M45 42h10M45 49h6" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                    <path d="M22 45h26v20H32l-10 8v-8H22a5 5 0 0 1-5-5V50a5 5 0 0 1 5-5z" fill="#c3c8cf" />
                    <path d="M25 53h4M33 53h4" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="27" cy="51" r="1.5" fill="#fff" />
                    <circle cx="35" cy="51" r="1.5" fill="#fff" />
                  </svg>
                </div>
                <span className="text-[#606e80] text-[13px]">Bạn chưa có ghi chú nào</span>
              </div>

              {customerNotes.length > 0 && (
                <div className="w-full px-4 pb-4 space-y-4">
                  {customerNotes.map((note) => (
                    <div key={note.id} className="group flex gap-2 text-[13px] text-slate-700">
                      <img
                        src={note.authorAvatar || NOTE_AUTHOR_AVATAR}
                        alt={note.authorName || NOTE_AUTHOR_NAME}
                        className="mt-1 h-6 w-6 rounded-full object-cover bg-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate font-semibold text-slate-800">{note.authorName || NOTE_AUTHOR_NAME}</span>
                            {note.pinned && <Pin className="h-3.5 w-3.5 fill-slate-500 text-slate-500" />}
                          </div>
                          <div className="flex shrink-0 items-center gap-2 text-slate-400">
                            <button type="button" onClick={() => handleEditNote(note)} className="opacity-0 transition group-hover:opacity-100 hover:text-blue-600">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => handleDeleteNote(note.id)} className="opacity-0 transition group-hover:opacity-100 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => handleTogglePinNote(note.id)} className={`opacity-0 transition group-hover:opacity-100 ${note.pinned ? "text-slate-600 opacity-100" : "hover:text-slate-600"}`}>
                              <Pin className={`h-4 w-4 ${note.pinned ? "fill-current" : ""}`} />
                            </button>
                            <span className="text-[12px] text-slate-500">{formatNoteTimestamp(note.createdAt)}</span>
                          </div>
                        </div>

                        {editingNoteId === note.id ? (
                          <div className="space-y-2">
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={handleCancelEditNote} className="rounded bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-700 hover:bg-slate-200">
                                Hủy
                              </button>
                              <button type="button" onClick={handleSaveEditedNote} className="rounded bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700">
                                Lưu
                              </button>
                            </div>
                            <div className="relative">
                              <Textarea
                                rows={2}
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full resize-none rounded-none border-0 bg-[#f0f2f5] p-3 pr-10 text-[13px] text-slate-700 shadow-none focus:ring-0"
                              />
                              <button type="button" onClick={() => handlePickImage("edit")} className="absolute right-3 top-3 text-slate-500 hover:text-blue-600">
                                <ImageIcon className="h-5 w-5" />
                              </button>
                            </div>
                            {editingImage.url && (
                              <div className="relative inline-block">
                                <img src={editingImage.url} alt={editingImage.name || "Note image"} className="max-h-24 rounded border border-slate-200 object-contain" />
                                <button type="button" onClick={() => setEditingImage({})} className="absolute -right-2 -top-2 rounded-full bg-slate-700 p-0.5 text-white">
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {note.text && <p className="whitespace-pre-wrap break-words leading-snug">{note.text}</p>}
                            {note.imageUrl && (
                              <img src={note.imageUrl} alt={note.imageName || "Note image"} className="mt-2 max-h-28 rounded border border-slate-200 object-contain" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Note Input */}
            <div className="w-full shrink-0 px-4 pb-3 pt-2 bg-white">
              <div className="relative">
                <Textarea
                  rows={1}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitNote();
                    }
                  }}
                  placeholder="Nhập ghi chú (Enter để gửi)"
                  className="w-full bg-[#f0f2f5] border-transparent resize-none text-[13px] rounded-md p-3 pb-8 text-[#606e80] shadow-none focus:ring-0 placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => handlePickImage("draft")}
                  className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700"
                >
                  <ImageIcon className="h-[18px] w-[18px]" />
                </button>
                {draftImage && (
                  <div className="mt-2 inline-block px-1">
                    <div className="relative">
                      <img src={draftImage.url} alt={draftImage.name} className="max-h-20 rounded border border-slate-200 object-contain" />
                      <button type="button" onClick={() => setDraftImage(null)} className="absolute -right-2 -top-2 rounded-full bg-slate-700 p-0.5 text-white">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
                <input
                  ref={noteFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleNoteImageSelected}
                />
              </div>
            </div>

          </div>

          <div
            onPointerDown={handleResizeNotes}
            className="group w-full touch-none select-none cursor-row-resize py-2 flex items-center justify-center bg-white hover:bg-slate-50"
          >
            <div className="flex-1 h-0.5 bg-gray-300 group-hover:bg-blue-600 transition-colors duration-150"></div>
            <span className="text-[13px] font-semibold text-[#4a5568] whitespace-nowrap px-3">Đơn hàng</span>
            <div className="flex-1 h-0.5 bg-gray-300 group-hover:bg-blue-600 transition-colors duration-150"></div>
          </div>

          {/* Orders History section */}
          <div className="flex-1 w-full flex flex-col items-center overflow-y-auto overscroll-contain pt-6 pb-6">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  {/* SVG for Sleepy Shopping Bag */}
                  <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M35 45h30v30H35z" fill="#e2e6eb" />
                    <path d="M45 45v-10a5 5 0 0 1 10 0v10" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                    <path d="M45 55a2 2 0 0 0 4 0M55 55a2 2 0 0 0 4 0" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="52" cy="65" r="1.5" fill="#94a3b8" />
                    <text x="25" y="42" fill="#94a3b8" fontSize="18" fontWeight="bold">Z</text>
                    <text x="35" y="30" fill="#94a3b8" fontSize="14" fontWeight="bold">z</text>
                    <text x="45" y="20" fill="#94a3b8" fontSize="10" fontWeight="bold">z</text>
                    <path d="M30 75h40" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div className="absolute top-1 right-0 w-[18px] h-[18px] bg-[#9ea7b8] text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-white">
                    0
                  </div>
                </div>
                <span className="text-[#606e80] text-[13px]">Chưa có lịch sử đơn hàng</span>
                <Button onClick={() => setActiveTab("create")} className="bg-[#e6f2ff] text-blue-600 hover:bg-[#d0e6ff] hover:text-blue-700 border-transparent text-[13px] px-3 py-1 rounded font-medium mt-1">
                  + Tạo đơn
                </Button>
              </div>
            ) : (
              <div className="space-y-3 w-full px-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="border border-gray-200 rounded-lg p-3 text-[13px] shadow-sm">
                    <div className="flex justify-between font-bold pb-2 border-b border-gray-100 mb-2">
                      <span className="text-blue-600">{ord.orderCode}</span>
                      <span className="text-gray-500">{ord.status}</span>
                    </div>
                    <div className="space-y-1 text-gray-600">
                      <div>Khách: <strong>{ord.customerName}</strong> - {ord.phone}</div>
                      <div className="truncate">ĐC: {ord.fullAddress}</div>
                      <div className="font-bold text-gray-800 pt-1">Tổng: {ord.total.toLocaleString("vi-VN")}đ</div>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <Button onClick={() => setActiveTab("create")} className="bg-[#e6f2ff] text-blue-600 hover:bg-[#d0e6ff] hover:text-blue-700 border-transparent text-[13px] px-4 py-1.5 rounded font-medium w-full">
                    + Tạo đơn mới
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitOrder} className="flex-1 flex flex-col overflow-hidden text-[13px] text-[#4a5568]">
          {/* Main content body (scrollable) */}
          <div className="flex-1 overflow-y-auto overscroll-contain overflow-x-hidden bg-[#f0f2f5]">

            {/* Customer Section */}
            <div className="p-2 bg-white space-y-1.5 border-b border-gray-200 shadow-sm">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="flex-1 bg-[#f0f2f5] border-transparent rounded h-[34px] px-3 text-[13px] focus:ring-0 text-slate-800 outline-none"
                />
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 bg-[#f0f2f5] border-transparent rounded h-[34px] px-3 text-[13px] focus:ring-0 text-slate-800 outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Địa chỉ"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#f0f2f5] border-transparent rounded h-[34px] px-3 text-[13px] focus:ring-0 text-slate-800 outline-none"
                />
              </div>
              <div className="relative">
                <select className="w-full bg-[#f0f2f5] border-transparent rounded h-[34px] px-3 text-[13px] focus:ring-0 appearance-none text-slate-400 outline-none">
                  <option>Chọn địa chỉ</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                </div>
              </div>
              <div className="flex justify-between items-center bg-[#f4f6f8] rounded h-[38px] px-3 cursor-pointer mt-0.5">
                <div className="flex items-center gap-2.5">
                  <img src={customer?.avatar || "https://ui-avatars.com/api/?name=User&background=random"} className="w-6 h-6 rounded-full object-cover" alt="Avatar" />
                  <span className="font-bold text-slate-800">{customerName || customer?.name || "Khách hàng"}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>

            <div className="h-2.5 bg-[#f0f2f5]"></div>

            {/* Products Section */}
            <div className="bg-white border-y border-gray-200 shadow-sm">
              <div className="flex justify-between items-center p-3 border-b border-gray-100">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-[14px]">
                  <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  <span>Sản phẩm</span>
                </div>
                <div className="text-[#2b65c2] cursor-pointer flex items-center gap-0.5 font-medium">
                  Kho mặc định <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                </div>
              </div>

              <div className="p-3">
                <div className="border border-gray-200 rounded overflow-hidden">
                  <div className="grid grid-cols-4 bg-[#f8fafc] p-2 text-center font-bold text-slate-700 border-b border-gray-200 text-[12px]">
                    <div className="text-left col-span-1 pl-2">Tên SP</div>
                    <div>SL:{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</div>
                    <div>Đơn giá</div>
                    <div className="text-right pr-2">Thành tiền</div>
                  </div>
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 bg-white">
                      {/* Empty Drawer SVG */}
                      <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25 45 L75 45 L65 70 L35 70 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M35 45 L42 30 L58 30 L65 45" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M40 45 A10 10 0 0 0 60 45" fill="none" stroke="#94a3b8" strokeWidth="2" />
                        <path d="M42 30 L58 30" stroke="#94a3b8" strokeWidth="2" />
                      </svg>
                      <span className="text-[#64748b]">Chưa có sản phẩm nào</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 bg-white">
                      {cartItems.map(item => (
                        <div key={item.product.id} className="grid grid-cols-4 p-2.5 text-center items-center text-[13px] text-slate-700">
                          <div className="text-left col-span-1 truncate pl-2 font-medium">{item.product.name}</div>
                          <div className="font-mono">{item.quantity}</div>
                          <div className="font-mono">{item.price.toLocaleString("vi-VN")}</div>
                          <div className="text-right pr-2 font-mono font-bold">{(item.price * item.quantity).toLocaleString("vi-VN")}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 relative flex items-center border border-gray-200 rounded overflow-hidden bg-white shadow-sm">
                    <svg className="w-4 h-4 text-gray-400 absolute left-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input type="text" placeholder="Tìm kiếm sản phẩm" className="w-full h-[34px] pl-8 pr-[60px] outline-none text-[13px] border-none focus:ring-0" />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                      <span className="bg-white border border-gray-200 text-slate-700 text-[11px] font-bold px-1.5 py-[1px] rounded shadow-sm">Combo</span>
                    </div>
                  </div>
                  <button type="button" className="w-9 h-[34px] bg-[#3269b8] rounded flex items-center justify-center shadow-sm hover:bg-blue-700 transition">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="h-2.5 bg-[#f0f2f5]"></div>

            {/* Payment Section */}
            <div className="bg-white border-t border-gray-200">
              <div className="flex justify-between items-center p-3 border-b border-gray-100">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-[14px]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                  <span>Thanh toán</span>
                </div>
                <div className="text-[#2b65c2] cursor-pointer flex items-center gap-0.5 font-medium">
                  Thêm hình thức <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
                </div>
              </div>

              <div className="p-3.5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-[#3269b8] w-4 h-4 focus:ring-[#3269b8]" />
                    <span className="text-[13px] text-slate-700">Miễn phí giao hàng</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-[#3269b8] w-4 h-4 focus:ring-[#3269b8]" />
                    <span className="text-[13px] text-slate-700">Chuyển khoản</span>
                  </label>
                </div>

                <div className="space-y-3.5 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Tổng giá trị đơn hàng</span>
                    <span className="font-bold text-slate-800 font-mono">{subTotal.toLocaleString("vi-VN")} đ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Phí vận chuyển</span>
                    <div className="relative w-28">
                      <input type="number" className="w-full h-7 bg-[#f0f2f5] border-transparent rounded text-right pr-6 focus:ring-0 text-[13px] font-mono outline-none" value={shippingFee} onChange={e => setShippingFee(Number(e.target.value) || 0)} />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-[12px]">đ</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Giảm giá</span>
                    <div className="relative w-28">
                      <input type="number" className="w-full h-7 bg-[#f0f2f5] border-transparent rounded text-right pr-6 focus:ring-0 text-[13px] font-mono outline-none" value={discount} onChange={e => setDiscount(Number(e.target.value) || 0)} />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 font-bold text-[12px]">đ</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-300 my-4"></div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Ghi chú nội bộ</span>
                    <span className="text-[#2b65c2] cursor-pointer">Thêm ghi chú</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">Ghi chú in</span>
                    <span className="text-[#2b65c2] cursor-pointer">Thêm ghi chú</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-2.5 bg-[#f0f2f5]"></div>

            {/* Other Information Section */}
            <div className="bg-white border-t border-gray-200 pb-8">
              <div className="flex justify-between items-center p-3 border-b border-gray-100">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-[14px]">
                  <List className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  <span>Thông tin khác</span>
                </div>
                <div className="text-[#2b65c2] cursor-pointer flex items-center gap-1 font-medium text-[13px]">
                  Phân công <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
              </div>

              <div className="p-3.5 space-y-3.5 text-[13px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Tạo lúc</span>
                  <span className="text-[#2b65c2] font-medium">23/06/2026 10:42</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Dự kiến nhận hàng</span>
                  <span className="text-[#2b65c2] font-medium">Chưa có</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Nguồn đơn</span>
                  <div className="flex items-center gap-1 text-[#2b65c2] font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                    <span>Facebook</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button type="button" className="flex items-center gap-1.5 text-[#2b65c2] border border-[#2b65c2] rounded px-3 py-1.5 text-[12px] font-medium hover:bg-blue-50 transition">
                    <TagIcon className="w-3.5 h-3.5" /> Thêm thẻ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="bg-white border-t border-gray-200 p-3 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-20">
            <div className="text-right text-red-600 font-bold text-[15px] pb-2 font-mono">
              {total.toLocaleString("vi-VN")} đ
            </div>
            <div className="flex gap-2.5">
              <button type="button" className="flex-1 h-9 bg-[#f0f2f5] text-[#606e80] rounded shadow-sm hover:bg-gray-200 transition">
                Thiết lập lại
              </button>
              <button type="submit" className="flex-[2] h-9 bg-[#2b65c2] text-white rounded font-bold shadow-sm hover:bg-blue-700 transition">
                Tạo đơn
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

