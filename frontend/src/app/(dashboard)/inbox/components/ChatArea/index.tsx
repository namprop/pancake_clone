"use client";

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Customer, Platform, Tag, QuickReply, Message } from "@/types";
import {
  Send,
  Sparkles,
  Tag as TagIcon,
  Bot,
  Lightbulb,
  Link as LinkIcon,
  Clock,
  User,
  Cake,
  ListTodo,
  MailCheck,
  PanelRight,
  Search,
  UserRoundPlus,
  HelpCircle,
  Paperclip,
  FileAudio,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Mic,
  Shirt,
  StickyNote,
  Phone,
  Video,
  Edit2,
  Printer,
  CheckSquare,
  Pin,
  PinOff,
  ChevronDown,
  ChevronUp,
  CornerUpLeft,
  X,
} from "lucide-react";
import { QUICK_REPLIES } from "@/data/mockData";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { useAppContext } from "@/contexts/AppContext";
import { Modal, message, Popover, Radio } from "antd";
import OrderCreator from "../OrderCreator";
import { useChatArea } from "@/hooks/useChatArea";
import { ImageGalleryModal } from "@/components/ui/ImageGalleryModal";
import { ReminderModal } from "@/components/ui/ReminderModal";

interface ChatAreaProps {
  customer: Customer | undefined;
  tags: Tag[];
  onSendMessage: (text: string, isQuickReply?: boolean, attachments?: any[], replyTo?: any) => void;
  onUpdateCustomerTags: (customerId: string, updatedTagIds: string[]) => void;
  onUpdateCustomerDetails: (customerId: string, fields: Partial<Customer>) => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  isUserConversationsOpen?: boolean;
  onToggleUserConversations?: () => void;
  isConversationInfoOpen?: boolean;
  onToggleConversationInfo?: () => void;
}

function isAudioMessage(msg: Message) {
  return (
    msg.messageType === "audio" ||
    msg.fileType?.startsWith("audio/") ||
    msg.fileName?.startsWith("audioclip-") ||
    !!msg.fileName?.match(/\.(mp3|wav|m4a|aac|ogg)$/i)
  );
}

function getRenderableImage(msg: Message) {
  if (msg.image) return msg.image;

  const fileLooksLikeImage =
    msg.messageType === "image" ||
    msg.messageType === "sticker" ||
    msg.fileType?.startsWith("image/") ||
    !!msg.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return fileLooksLikeImage ? msg.fileUrl : undefined;
}

type AttachmentCategory = "image" | "video" | "audio" | "document" | "unsupported";

const FILE_ATTACHMENT_ACCEPT = [
  "video/*",
  "audio/*",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
  ".rtf",
  ".csv",
].join(",");

function getAttachmentCategory(fileType?: string, fileName?: string): AttachmentCategory {
  const type = fileType || "";
  const name = fileName || "";

  if (type.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name)) return "image";
  if (type.startsWith("video/") || /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(name)) return "video";
  if (type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(name)) return "audio";
  if (
    type.includes("pdf") ||
    type.includes("word") ||
    type.includes("excel") ||
    type.includes("spreadsheet") ||
    type.includes("presentation") ||
    type.startsWith("text/") ||
    /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf|csv)$/i.test(name)
  ) {
    return "document";
  }

  return "unsupported";
}

function getAttachmentLabel(category: AttachmentCategory) {
  if (category === "video") return "Video";
  if (category === "audio") return "Âm thanh";
  return "Tệp văn bản";
}

function formatAttachmentSize(size?: number) {
  if (!size && size !== 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getAttachmentMeta(attachment: any) {
  const category = getAttachmentCategory(attachment.file?.type || attachment.fileType, attachment.name || attachment.file?.name);
  const size = attachment.file?.size || attachment.fileSize;
  return {
    category,
    label: getAttachmentLabel(category),
    sizeText: formatAttachmentSize(size),
    name: attachment.name || attachment.file?.name || "Tệp đính kèm",
  };
}

const DEFAULT_ASSIGNEE_NAME = "Phạm Tiến Nam";
const ASSIGNABLE_EMPLOYEES = [
  {
    id: "pham-tien-nam",
    name: DEFAULT_ASSIGNEE_NAME,
  },
];
type ConversationHistoryTab = "tags" | "assignee";
type TagWithMongoId = Tag & { _id?: string };
type CustomerGender = NonNullable<Customer["gender"]>;

const GENDER_OPTIONS: Array<{ value: CustomerGender; label: string }> = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "unknown", label: "Không xác định" },
];

function getCustomerGender(customer?: Customer): CustomerGender {
  return customer?.gender || "male";
}

function getGenderLabel(gender: CustomerGender) {
  return GENDER_OPTIONS.find((option) => option.value === gender)?.label || "Nam";
}

function getGenderIconClass(gender: CustomerGender) {
  if (gender === "female") return "text-pink-500";
  if (gender === "unknown") return "text-slate-400";
  return "text-green-500";
}

function parseBirthdayDate(value?: string | null) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function getInitialBirthdayDate(customer?: Customer) {
  return parseBirthdayDate(customer?.birthday) || new Date();
}

function formatBirthdayValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatBirthdayDisplay(value?: string | null) {
  const date = parseBirthdayDate(value);
  if (!date) return "Chưa có ngày sinh";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${day}/${month}/${date.getFullYear()}`;
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function clampBirthdayDate(year: number, monthIndex: number, day: number) {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const rawDate = new Date(year, monthIndex, 1);
  let safeYear = rawDate.getFullYear();
  let safeMonth = rawDate.getMonth();

  if (safeYear > currentYear) {
    safeYear = currentYear;
    safeMonth = 11;
  } else if (safeYear < minYear) {
    safeYear = minYear;
    safeMonth = 0;
  }

  return new Date(safeYear, safeMonth, Math.min(day, getDaysInMonth(safeYear, safeMonth)));
}

function getBirthdayCalendarCells(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayBasedStart = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - mondayBasedStart);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

function getTagRecordId(tag: TagWithMongoId) {
  return tag._id || tag.id;
}

function getHistoryTagColor(tag?: Tag) {
  if (!tag?.color) return "#3b82f6";
  if (tag.color.startsWith("#")) return tag.color;
  if (tag.color.includes("emerald")) return "#10b981";
  if (tag.color.includes("pink")) return "#ec4899";
  if (tag.color.includes("amber")) return "#f59e0b";
  if (tag.color.includes("purple")) return "#8b3bb8";
  if (tag.color.includes("rose")) return "#f43f5e";
  return "#2ea3f2";
}

function formatHistoryDate(date: Date) {
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatHistoryTime(date: Date) {
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getConversationLinkId(customer: Customer) {
  const pageId = (
    customer.pageId ||
    customer.facebookConversationId?.split("_")[0] ||
    customer.id
  ).trim();
  const customerId = (customer.facebookCustomerId || customer.id).trim();
  const conversationId = (
    customer.facebookConversationId ||
    `${pageId}_${customerId}`
  ).trim();

  return conversationId;
}

function buildLocalConversationLink(customer: Customer) {
  const conversationId = getConversationLinkId(customer);

  if (typeof window === "undefined") {
    return `/inbox?c_id=${encodeURIComponent(conversationId)}`;
  }

  const url = new URL(window.location.href);
  url.pathname = "/inbox";
  url.searchParams.set("c_id", conversationId);
  url.hash = "";

  return url.toString();
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textArea);

  if (!copied) {
    throw new Error("Copy failed");
  }
}

export default function ChatArea({
  customer,
  tags,
  onSendMessage,
  onUpdateCustomerTags,
  onUpdateCustomerDetails,
  isSimulating,
  setIsSimulating,
  isUserConversationsOpen = false,
  onToggleUserConversations,
  isConversationInfoOpen = false,
  onToggleConversationInfo,
}: ChatAreaProps) {
  const {
    workspaceSettings,
    quickReplies,
    quickReplyTopics,
    handleCreateOrder,
    showQuickReplies,
    setShowQuickReplies,
    showQuickReplyPopover,
    setShowQuickReplyPopover,
    filteredQuickReplies,
    setFilteredQuickReplies,
    selectedQRIndex,
    setSelectedQRIndex,
    inputText,
    setInputText,
    showShortcuts,
    setShowShortcuts,
    filteredShortcuts,
    setFilteredShortcuts,
    typingState,
    setTypingState,
    callModalOpen,
    setCallModalOpen,
    isOrderCreatorOpen,
    setIsOrderCreatorOpen,
    replyingTo,
    setReplyingTo,
    chatEndRef,
    inputRef,
    insertQuickReply,
    handleSend,
    handleKeyDown,
    handleTagToggle,
    handleCallResult,
    handleAvatarError,
    pendingAttachments,
    setPendingAttachments,
    handleTogglePinMessage,
  } = useChatArea(customer, onSendMessage, onUpdateCustomerTags);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentPinIndex, setCurrentPinIndex] = useState(0);
  const [isPinsExpanded, setIsPinsExpanded] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderMessageText, setReminderMessageText] = useState("");
  const [isSelectingMultiple, setIsSelectingMultiple] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [isConversationHistoryOpen, setIsConversationHistoryOpen] = useState(false);
  const [conversationHistoryTab, setConversationHistoryTab] = useState<ConversationHistoryTab>("tags");
  const [genderPopoverOpen, setGenderPopoverOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState<CustomerGender>("male");
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const [selectedBirthdayDate, setSelectedBirthdayDate] = useState(() => getInitialBirthdayDate(customer));
  const [isFilePopoverOpen, setIsFilePopoverOpen] = useState(false);
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAssigned = Boolean(customer?.assigneeName);
  const hasUnreadMessages = Boolean(customer?.unreadCount && customer.unreadCount > 0);
  const currentGender = getCustomerGender(customer);
  const currentGenderLabel = getGenderLabel(currentGender);
  const hasGenderChanged = selectedGender !== currentGender;
  const currentBirthdayValue = customer?.birthday || "";
  const selectedBirthdayValue = formatBirthdayValue(selectedBirthdayDate);
  const hasBirthdayChanged = selectedBirthdayValue !== currentBirthdayValue;
  const birthdayCalendarCells = getBirthdayCalendarCells(selectedBirthdayDate);
  const currentYear = new Date().getFullYear();
  const birthdayYears = Array.from({ length: 101 }, (_, index) => currentYear - index);
  const fileAttachments = (customer?.chatHistory || [])
    .map((msg) => ({
      id: msg.id,
      url: msg.fileUrl || msg.image || "",
      name: msg.fileName || msg.text || "Tệp đính kèm",
      fileType: msg.fileType || (msg.messageType === "video" ? "video/" : msg.messageType === "audio" ? "audio/" : ""),
      fileSize: msg.fileSize,
    }))
    .filter((attachment) => {
      const category = getAttachmentMeta(attachment).category;
      return category === "video" || category === "audio" || category === "document";
    });
  const visibleFileAttachments = fileAttachments.filter((attachment) => {
    const name = getAttachmentMeta(attachment).name.toLowerCase();
    return name.includes(fileSearchQuery.trim().toLowerCase());
  });

  useEffect(() => {
    setSelectedGender(getCustomerGender(customer));
  }, [customer?.id, customer?.gender]);

  useEffect(() => {
    setSelectedBirthdayDate(getInitialBirthdayDate(customer));
  }, [customer?.id, customer?.birthday]);

  useLayoutEffect(() => {
    if (!customer?.id) return;

    let secondFrameId = 0;
    const scrollToBottom = () => {
      const messagesEl = messagesScrollRef.current;
      if (!messagesEl) return;

      messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    const firstFrameId = window.requestAnimationFrame(() => {
      scrollToBottom();
      secondFrameId = window.requestAnimationFrame(scrollToBottom);
    });
    const timeoutIds = [
      window.setTimeout(scrollToBottom, 80),
      window.setTimeout(scrollToBottom, 240),
    ];

    return () => {
      window.cancelAnimationFrame(firstFrameId);
      if (secondFrameId) window.cancelAnimationFrame(secondFrameId);
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [customer?.id, customer?.chatHistory.length]);

  const handleAssignConversation = (assigneeName: string) => {
    if (!customer) return;

    onUpdateCustomerDetails(customer.id, {
      assigneeName,
      assignedAt: new Date(),
    });
    setAssigneePopoverOpen(false);
    message.success(`Đã phân công cho ${assigneeName}`);
  };

  const filteredAssignableEmployees = ASSIGNABLE_EMPLOYEES.filter((employee) =>
    employee.name.toLowerCase().includes(assigneeSearch.trim().toLowerCase())
  );

  const handleSaveGender = () => {
    if (!customer || !hasGenderChanged) return;

    onUpdateCustomerDetails(customer.id, { gender: selectedGender });
    setGenderPopoverOpen(false);
    message.success(`Đã cập nhật giới tính: ${getGenderLabel(selectedGender)}`);
  };

  const handleOpenBirthdayModal = () => {
    setSelectedBirthdayDate(getInitialBirthdayDate(customer));
    setIsBirthdayModalOpen(true);
  };

  const handleSaveBirthday = () => {
    if (!customer || !hasBirthdayChanged) return;

    onUpdateCustomerDetails(customer.id, { birthday: selectedBirthdayValue });
    setIsBirthdayModalOpen(false);
    message.success(`Đã lưu ngày sinh: ${formatBirthdayDisplay(selectedBirthdayValue)}`);
  };

  const handleSelectBirthdayDay = (day: number) => {
    setSelectedBirthdayDate((current) => clampBirthdayDate(current.getFullYear(), current.getMonth(), day));
  };

  const handleSelectBirthdayMonth = (monthIndex: number) => {
    setSelectedBirthdayDate((current) => clampBirthdayDate(current.getFullYear(), monthIndex, current.getDate()));
  };

  const handleSelectBirthdayYear = (year: number) => {
    setSelectedBirthdayDate((current) => clampBirthdayDate(year, current.getMonth(), current.getDate()));
  };

  const handleMoveBirthdayMonth = (offset: number) => {
    setSelectedBirthdayDate((current) => clampBirthdayDate(current.getFullYear(), current.getMonth() + offset, current.getDate()));
  };

  const handleSelectDocumentFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    const allowedFiles = files.filter((file) => {
      const category = getAttachmentCategory(file.type, file.name);
      return category === "video" || category === "audio" || category === "document";
    });

    if (allowedFiles.length !== files.length) {
      message.warning("Chỉ hỗ trợ video, âm thanh và tài liệu ở nút này.");
    }

    if (allowedFiles.length === 0) return;

    const nextAttachments = allowedFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}-${file.name}`,
      url: URL.createObjectURL(file),
      name: file.name,
      file,
      fileType: file.type,
      fileSize: file.size,
    }));

    setPendingAttachments((prev) => [...prev, ...nextAttachments]);
    setIsFilePopoverOpen(false);
  };

  const renderAttachmentIcon = (category: AttachmentCategory) => {
    if (category === "video") return <Video className="h-5 w-5 text-slate-500" strokeWidth={1.8} />;
    if (category === "audio") return <FileAudio className="h-5 w-5 text-slate-500" strokeWidth={1.8} />;
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-white text-slate-500">
        <FileText className="h-4 w-4" strokeWidth={1.8} />
      </div>
    );
  };

  const filePopoverContent = (
    <div className="flex h-[540px] w-[480px] flex-col rounded-lg bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-[18px] font-bold text-slate-800">Tệp và video âm thanh</h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[15px] font-semibold text-[#1264d8] transition hover:text-[#0b56c4]"
        >
          Thêm mới
        </button>
      </div>

      <div className="mb-2.5 flex h-[38px] items-center gap-2 rounded-md bg-[#eef1f5] px-3 py-2 text-slate-500">
        <Search className="h-[18px] w-[18px] shrink-0 text-slate-700" strokeWidth={2} />
        <input
          value={fileSearchQuery}
          onChange={(event) => setFileSearchQuery(event.target.value)}
          placeholder="Tìm kiếm"
          className="h-7 min-w-0 flex-1 bg-transparent text-[16px] text-slate-700 outline-none placeholder:text-slate-500"
        />
      </div>

      {visibleFileAttachments.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center pb-12 text-center">
          <div className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-[#eef3fb]">
            <FileText className="h-16 w-16 text-slate-300" strokeWidth={1.4} />
            <Search className="absolute bottom-3 right-2 h-12 w-12 text-slate-400" strokeWidth={2.1} />
            <span className="absolute left-0 top-10 h-2 w-2 rounded-full bg-[#e7eefb]" />
            <span className="absolute right-4 top-0 h-2 w-2 rounded-full bg-[#e7eefb]" />
          </div>
          <p className="text-[18px] font-semibold text-slate-600">Chưa có file nào được tải lên</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1">
          {visibleFileAttachments.map((attachment) => {
            const meta = getAttachmentMeta(attachment);
            return (
              <button
                type="button"
                key={attachment.id}
                className="mb-2 flex w-full items-center gap-3 rounded-md bg-[#dff1ff] p-2 text-left transition hover:bg-[#d5ebff]"
              >
                <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white">
                  {renderAttachmentIcon(meta.category)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-medium text-slate-800">{meta.name}</p>
                  <p className="mt-1 text-[14px] text-slate-400">
                    {meta.label}{meta.sizeText ? ` · ${meta.sizeText}` : ""}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const genderPopoverContent = (
    <div className="w-[440px] rounded-lg bg-white p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-[15px] text-slate-700">
        <span className="font-medium">Giới tính:</span>
        <Radio.Group
          value={selectedGender}
          onChange={(event) => setSelectedGender(event.target.value)}
          className="flex flex-wrap items-center gap-x-5 gap-y-2"
        >
          {GENDER_OPTIONS.map((option) => (
            <Radio key={option.value} value={option.value} className="text-[15px] text-slate-700">
              {option.label}
            </Radio>
          ))}
        </Radio.Group>
      </div>
      <button
        type="button"
        onClick={handleSaveGender}
        disabled={!hasGenderChanged}
        className={`mt-5 rounded-md border px-4 py-2 text-[14px] font-medium transition ${
          hasGenderChanged
            ? "border-blue-500 bg-blue-500 text-white hover:bg-blue-600"
            : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"
        }`}
      >
        Lưu
      </button>
    </div>
  );

  const assigneePopoverContent = (
    <div className="w-[310px] rounded-lg bg-white p-2">
      <div className="flex h-10 items-center gap-2 rounded-md bg-[#eef1f5] px-3 text-slate-500">
        <Search className="h-5 w-5" strokeWidth={1.8} />
        <input
          value={assigneeSearch}
          onChange={(e) => setAssigneeSearch(e.target.value)}
          placeholder="Phân công nhân viên"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-slate-700 outline-none placeholder:text-slate-500"
        />
      </div>
      <div className="mt-2 max-h-[220px] overflow-y-auto">
        {filteredAssignableEmployees.map((employee) => (
          <button
            key={employee.id}
            type="button"
            onClick={() => handleAssignConversation(employee.name)}
            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-[15px] text-slate-700 transition-colors hover:bg-slate-50"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=e5e7eb&color=94a3b8`}
              alt={employee.name}
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="truncate">{employee.name}</span>
          </button>
        ))}
        {filteredAssignableEmployees.length === 0 && (
          <div className="px-3 py-4 text-center text-[13px] text-slate-400">
            Không tìm thấy nhân viên
          </div>
        )}
      </div>
    </div>
  );

  const handleToggleUnreadConversation = () => {
    if (!customer) return;

    const nextUnreadCount = hasUnreadMessages ? 0 : 1;
    onUpdateCustomerDetails(customer.id, {
      unreadCount: nextUnreadCount,
      lastReadAt: nextUnreadCount === 0 ? new Date().toISOString() : null,
    });
    message.success(nextUnreadCount > 0 ? "Đã đánh dấu chưa đọc" : "Đã đánh dấu đã đọc");
  };

  const handleCopyConversationLink = async () => {
    if (!customer) return;

    const conversationLink = buildLocalConversationLink(customer);

    try {
      await copyTextToClipboard(conversationLink);
      message.success({
        content: (
          <span>
            Copied <span className="text-[#1890ff]">{conversationLink}</span>
          </span>
        ),
        duration: 3,
      });
    } catch {
      message.error("Không thể copy link hội thoại");
    }
  };

  const handleOpenConversationHistory = () => {
    setConversationHistoryTab("tags");
    setIsConversationHistoryOpen(true);
  };

  const handlePrintMessages = (messagesToPrint: Message[], separatePages: boolean) => {
    const shopName = customer?.pageName || "Buôn Bán Niềm Tin";
    const customerName = customer?.name || "Khách hàng";

    let contentHtml = "";

    messagesToPrint.forEach((msg, index) => {
      const date = new Date(msg.timestamp);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;

      const msgText = msg.text ? msg.text : (msg.messageType === 'image' ? '[Hình ảnh]' : '[File đính kèm]');

      let mediaHtml = "";
      const imgUrl = msg.image || (msg.messageType === 'image' && msg.fileUrl);
      if (imgUrl) {
        mediaHtml = `<div style="margin-top: 10px; text-align: center;"><img src="${imgUrl}" style="max-width: 250px; max-height: 250px; object-fit: contain;" /></div>`;
      }

      const pageBreakStyle = (separatePages && index < messagesToPrint.length - 1) ? 'page-break-after: always;' : (index < messagesToPrint.length - 1 ? 'border-bottom: 1px dashed #ccc; padding-bottom: 30px; margin-bottom: 30px;' : '');

      contentHtml += `
        <div style="${pageBreakStyle}">
          <h2 style="text-align: center; font-size: 16px; margin: 0 0 4px 0; font-family: Arial, sans-serif;">${shopName}</h2>
          <div style="text-align: center; font-size: 13px; font-weight: bold; margin-bottom: 2px; font-family: Arial, sans-serif;">Đến: ${customerName}</div>
          <div style="text-align: center; font-size: 11px; margin-bottom: 15px; font-family: Arial, sans-serif;">${formattedDate}</div>
          
          <div style="text-align: center; font-size: 14px; font-family: Arial, sans-serif; white-space: pre-wrap; word-wrap: break-word;">${msgText}</div>
          ${mediaHtml}
          
          <div style="text-align: center; font-size: 10px; color: blue; margin-top: 15px; text-decoration: underline; font-family: Arial, sans-serif;">
            https://www.facebook.com/${msg.id || customer?.id || ""}
          </div>
        </div>
      `;
    });

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>In tin nhắn</title>
          <style>
            body { font-family: Arial, sans-serif; color: #000; padding: 20px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${contentHtml}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 5000);
    }, 500);
  };

  if (!customer) {
    return (
      <div className="flex-1 bg-sky-50/30 flex flex-col h-full items-center justify-center border-r border-sky-100">
        <div className="text-sky-300 mb-4">
          <MessageCircle className="w-16 h-16" />
        </div>
        <h2 className="text-slate-600 font-medium text-lg">Chưa chọn đoạn chat</h2>
        <p className="text-slate-400 text-sm mt-1">Vui lòng chọn một cuộc trò chuyện từ danh sách</p>
      </div>
    );
  }

  const historyBaseTime = new Date(customer.timestamp || Date.now());
  const selectedTagHistoryItems = customer.tags
    .map((tagId, index) => {
      const tag = tags.find((item) => getTagRecordId(item as TagWithMongoId) === tagId);
      const timestamp = new Date(historyBaseTime.getTime() - index * 5 * 60 * 1000);

      return {
        id: `${customer.id}-${tagId}-${index}`,
        actor: DEFAULT_ASSIGNEE_NAME,
        actionText: "Đã thêm thẻ",
        tagName: tag?.name || tagId,
        tagColor: getHistoryTagColor(tag),
        timestamp,
        actionTone: "add" as const,
      };
    });
  const fallbackTagHistoryItems = selectedTagHistoryItems.length
    ? []
    : tags.slice(0, 4).map((tag, index) => {
        const timestamp = new Date(historyBaseTime.getTime() - index * 5 * 60 * 1000);
        const isRemoved = index % 3 === 0;

        return {
          id: `${customer.id}-fallback-${getTagRecordId(tag as TagWithMongoId)}-${index}`,
          actor: DEFAULT_ASSIGNEE_NAME,
          actionText: isRemoved ? "Đã bỏ thẻ" : "Đã thêm thẻ",
          tagName: tag.name,
          tagColor: getHistoryTagColor(tag),
          timestamp,
          actionTone: isRemoved ? ("remove" as const) : ("add" as const),
        };
      });
  const tagHistoryItems = selectedTagHistoryItems.length
    ? selectedTagHistoryItems
    : fallbackTagHistoryItems;
  const assignmentHistoryItems = customer.assigneeName
    ? [
        {
          id: `${customer.id}-assignee`,
          actor: DEFAULT_ASSIGNEE_NAME,
          assigneeName: customer.assigneeName,
          timestamp: new Date(customer.assignedAt || historyBaseTime),
        },
      ]
    : [];

  const getMessageMoreOptionsContent = (msg: Message) => (
    <div className="flex flex-col min-w-[160px] py-1 text-sm text-slate-700">
      <button
        className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-100 transition-colors text-left w-full"
        onClick={() => handlePrintMessages([msg], false)}
      >
        <Printer className="w-[18px] h-[18px] text-slate-500" strokeWidth={1.5} />
        In
      </button>
      <button
        className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-100 transition-colors text-left w-full"
        onClick={() => {
          setIsSelectingMultiple(true);
          setSelectedMessageIds([msg.id]);
        }}
      >
        <CheckSquare className="w-[18px] h-[18px] text-slate-500" strokeWidth={1.5} />
        Chọn nhiều tin
      </button>
      <button
        className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-100 transition-colors text-left w-full"
        onClick={() => {
          setReminderMessageText(msg.text || "[Hình ảnh/File]");
          setIsReminderModalOpen(true);
        }}
      >
        <Clock className="w-[18px] h-[18px] text-slate-500" strokeWidth={1.5} />
        Tạo nhắc hẹn
      </button>
    </div>
  );

  const quickReplyPopoverContent = (
    <div className="w-[320px] max-h-[400px] overflow-y-auto flex flex-col bg-white">
      <div className="p-3 border-b border-gray-100 font-semibold text-[14px] text-gray-700 sticky top-0 bg-white z-20 flex justify-between items-center shadow-sm">
        <span>Mẫu câu trả lời nhanh</span>
        <button onClick={() => setShowQuickReplyPopover(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="flex flex-col">
        {workspaceSettings?.quickReplySettings?.enableTopics ? (
          <>
            {quickReplyTopics.map((topic) => {
              const repliesInTopic = quickReplies.filter((qr) => qr.topicId === topic.id);
              if (repliesInTopic.length === 0) return null;
              return (
                <div key={topic.id}>
                  <div className="bg-gray-50/90 px-3 py-2 text-[12px] font-semibold border-b border-gray-100 flex items-center gap-1.5 sticky top-[45px] z-10 backdrop-blur-sm" style={{ color: topic.color }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: topic.color }}></div>
                    {topic.name}
                  </div>
                  {repliesInTopic.map((qr) => (
                    <div
                      key={qr.id}
                      className="px-3 py-2.5 hover:bg-sky-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors flex gap-2 group"
                      onClick={() => insertQuickReply(qr.text)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 mt-0.5 shrink-0 group-hover:text-blue-500 transition-colors"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /><path d="M8 10h8" /><path d="M8 14h8" /></svg>
                      <div className="text-[13px] text-gray-700" title={qr.text}>{qr.text}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        ) : (
          quickReplies.map((qr) => (
            <div
              key={qr.id}
              className="px-3 py-2.5 hover:bg-sky-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors flex gap-2 group"
              onClick={() => insertQuickReply(qr.text)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 mt-0.5 shrink-0 group-hover:text-blue-500 transition-colors"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /><path d="M8 10h8" /><path d="M8 14h8" /></svg>
              <div className="text-[13px] text-gray-700" title={qr.text}>{qr.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-sky-50/30 flex flex-col h-full overflow-hidden border-r border-sky-100 relative">
      <div className="p-3 bg-white border-b border-sky-100 flex justify-between items-center shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <img src={customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full object-cover border border-sky-100" referrerPolicy="no-referrer" onError={(e) => handleAvatarError(e, customer.name)} />
            <div className="absolute -bottom-1 -right-1">
              {customer.platform === Platform.FACEBOOK && <span className="w-4 h-4 bg-blue-600 rounded-full text-white text-[9px] flex items-center justify-center font-bold">f</span>}
              {customer.platform === Platform.INSTAGRAM && <span className="w-4 h-4 bg-gradient-to-tr from-yellow-500 to-purple-600 rounded-full text-white text-[9px] flex items-center justify-center font-bold">📸</span>}
              {customer.platform === Platform.SHOPEE && <span className="w-4 h-4 bg-orange-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">S</span>}
              {customer.platform === Platform.TIKTOK && <span className="w-4 h-4 bg-slate-900 rounded-full text-cyan-400 text-[8px] flex items-center justify-center font-bold">T</span>}
              {customer.platform === Platform.WHATSAPP && <span className="w-4 h-4 bg-emerald-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">W</span>}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-700 truncate">{customer.name}</h2>
              <span className="text-[10px] text-gray-400">Đã xem bởi Phạm Tiến Nam - {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-gray-400">
              <button
                type="button"
                onClick={handleCopyConversationLink}
                title="Link Hội thoại"
                className="flex items-center transition hover:text-blue-500"
              >
                <LinkIcon className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={handleOpenConversationHistory}
                title="Lịch sử hội thoại"
                className="flex items-center transition hover:text-blue-500"
              >
                <Clock className="w-3 h-3" />
              </button>
              <Popover
                content={genderPopoverContent}
                trigger="click"
                open={genderPopoverOpen}
                onOpenChange={(open) => {
                  setGenderPopoverOpen(open);
                  if (open) {
                    setSelectedGender(currentGender);
                  }
                }}
                placement="bottomLeft"
                arrow
              >
                <button
                  type="button"
                  title={`Giới tính: ${currentGenderLabel}`}
                  className={`flex items-center transition hover:text-blue-500 ${getGenderIconClass(currentGender)}`}
                >
                  <User className="w-3 h-3" />
                </button>
              </Popover>
              <button
                type="button"
                onClick={handleOpenBirthdayModal}
                title={`Ngày sinh: ${formatBirthdayDisplay(customer.birthday)}`}
                className={`flex items-center transition hover:text-blue-500 ${
                  customer.birthday ? "text-slate-600" : ""
                }`}
              >
                <Cake className="w-3 h-3" />
              </button>
              {customer.phone && (
                <div className="flex items-center gap-1 border-l pl-2 ml-1">
                  <button onClick={() => setCallModalOpen(true)} className="hover:text-blue-500 transition">
                    <Phone className="w-3 h-3" />
                  </button>
                  <Video className="w-3 h-3 hover:text-blue-500 cursor-pointer" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 text-gray-500">
          <Popover
            content={assigneePopoverContent}
            trigger="click"
            open={assigneePopoverOpen}
            onOpenChange={setAssigneePopoverOpen}
            placement="bottomRight"
            arrow={false}
          >
            <button
              type="button"
              title="Phân công nhân viên"
              className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${isAssigned || assigneePopoverOpen ? "bg-blue-100 text-blue-600" : "bg-[#f0f2f5] hover:bg-gray-200 hover:text-blue-500"}`}
            >
              <UserRoundPlus className="w-[18px] h-[18px]" strokeWidth={2.25} />
            </button>
          </Popover>
          <button
            type="button"
            onClick={onToggleUserConversations}
            title="Tất cả hội thoại của người dùng này"
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${isUserConversationsOpen ? "bg-blue-100 text-blue-600" : "bg-[#f0f2f5] hover:bg-gray-200 hover:text-blue-500"}`}
          >
            <ListTodo className="w-[18px] h-[18px]" strokeWidth={2.15} />
          </button>
          <button
            type="button"
            onClick={handleToggleUnreadConversation}
            title={hasUnreadMessages ? "Đánh dấu đã đọc" : "Đánh dấu chưa đọc"}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${hasUnreadMessages ? "bg-orange-50 text-orange-500" : "bg-[#f0f2f5] hover:bg-gray-200 hover:text-orange-500"}`}
          >
            <MailCheck className="w-[18px] h-[18px]" strokeWidth={2.15} />
          </button>
          <button
            type="button"
            onClick={onToggleConversationInfo}
            title="Thông tin hội thoại"
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-colors ${isConversationInfoOpen ? "bg-blue-100 text-blue-600" : "bg-[#f0f2f5] hover:bg-gray-200 hover:text-blue-500"}`}
          >
            <PanelRight className="w-[18px] h-[18px]" strokeWidth={2.15} />
          </button>
        </div>
      </div>

      {/* Pinned Messages Area */}
      {(() => {
        const pinnedMessages = customer.chatHistory.filter(m => m.isPinned);
        if (pinnedMessages.length === 0) return null;

        // Ensure index is within bounds if messages are unpinned
        const safeIndex = currentPinIndex >= pinnedMessages.length ? Math.max(0, pinnedMessages.length - 1) : currentPinIndex;
        const msg = pinnedMessages[safeIndex];

        const scrollToMessage = (msgId: string) => {
          const el = document.getElementById(`message-${msgId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('bg-sky-100', 'transition-colors', 'duration-500');
            setTimeout(() => el.classList.remove('bg-sky-100'), 1500);
          }
        };

        const handleNextPin = (e: React.MouseEvent) => {
          e.stopPropagation();
          setCurrentPinIndex((prev) => (prev + 1) % pinnedMessages.length);
        };

        const handlePrevPin = (e: React.MouseEvent) => {
          e.stopPropagation();
          setCurrentPinIndex((prev) => (prev - 1 + pinnedMessages.length) % pinnedMessages.length);
        };

        return (
          <div className="bg-white border-b border-gray-200 shrink-0 z-20 shadow-sm flex flex-col relative">
            <div
              onClick={() => {
                if (isPinsExpanded) {
                  setIsPinsExpanded(false);
                } else {
                  scrollToMessage(msg.id);
                }
              }}
              className="px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <Pin className="w-4 h-4 text-slate-600 fill-slate-600" />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="text-[12px] font-semibold text-slate-600 mb-0.5">
                  Tin đã ghim · {pinnedMessages.length}/10
                </div>
                <div className="text-[13px] text-slate-800 line-clamp-1">
                  {msg.text || (msg.messageType === 'image' ? '[Hình ảnh]' : msg.messageType === 'audio' ? '[Tin nhắn thoại]' : '[File đính kèm]')}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePinMessage(customer.id, msg.id);
                  }}
                  className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors"
                  title="Bỏ ghim"
                >
                  <PinOff className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPinsExpanded(!isPinsExpanded);
                  }}
                  className="p-1.5 hover:bg-slate-200 rounded-md text-slate-600 transition-colors"
                >
                  <ChevronDown className="w-[18px] h-[18px]" strokeWidth={2} />
                </button>
              </div>
            </div>

            {isPinsExpanded && (
              <>
                {/* Backdrop to close when clicking outside */}
                <div
                  className="fixed inset-0 z-20 bg-black/5"
                  onClick={() => setIsPinsExpanded(false)}
                />

                {/* Absolute dropdown container */}
                <div className="absolute top-0 left-0 flex flex-col bg-white w-full shadow-lg z-30 rounded-b-xl border-b border-gray-200">
                  <div
                    className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors rounded-t-xl"
                    onClick={() => setIsPinsExpanded(false)}
                  >
                    <div className="flex flex-col">
                      <span className="text-[14px] font-semibold text-slate-800">Tin đã ghim</span>
                      <span className="text-[12px] text-slate-500">{pinnedMessages.length}/10 đã sử dụng</span>
                    </div>
                    <ChevronUp className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <div className="h-[1px] bg-gray-100 w-full" />
                  <div className="flex flex-col max-h-[300px] overflow-y-auto py-2">
                    {pinnedMessages.map((pm) => (
                      <div
                        key={`expanded-pin-${pm.id}`}
                        onClick={() => {
                          scrollToMessage(pm.id);
                          setIsPinsExpanded(false);
                        }}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors"
                      >
                        <div className="text-[13px] text-slate-700 line-clamp-2 pr-4 flex-1">
                          {pm.text || (pm.messageType === 'image' ? '[Hình ảnh]' : pm.messageType === 'audio' ? '[Tin nhắn thoại]' : '[File đính kèm]')}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePinMessage(customer.id, pm.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-all shrink-0"
                          title="Bỏ ghim"
                        >
                          <PinOff className="w-[18px] h-[18px]" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })()}

      <div ref={messagesScrollRef} className="flex-1 overflow-y-auto overscroll-contain p-4 bg-[#e4e1de] flex flex-col">
        <div className="text-center py-2.5 mb-2">
          <span className="text-[10px] bg-[#d5d1cc] text-gray-600 px-3 py-1 rounded-md shadow-sm">
            Hôm qua
          </span>
        </div>

        {customer.chatHistory.map((msg, index) => {
          const isMe = msg.sender === "shop";
          const prevMsg = index > 0 ? customer.chatHistory[index - 1] : null;
          const nextMsg = index < customer.chatHistory.length - 1 ? customer.chatHistory[index + 1] : null;

          const isConsecutiveWithPrev = prevMsg && prevMsg.sender === msg.sender && (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 5 * 60000);
          const isConsecutiveWithNext = nextMsg && nextMsg.sender === msg.sender && (new Date(nextMsg.timestamp).getTime() - new Date(msg.timestamp).getTime() < 5 * 60000);

          if (msg.sender === "system") {
            return (
              <div key={msg.id} className={`flex justify-center my-1 select-none ${!isConsecutiveWithPrev ? "mt-3" : ""}`}>
                <span className="text-[10px] bg-white text-slate-400 px-2.5 py-0.5 rounded-full border border-sky-100 shadow-sm">
                  {msg.text}
                </span>
              </div>
            );
          }

          const textContent = msg.text ? msg.text.trim() : "";
          const renderableImage = getRenderableImage(msg);
          const isVoiceOnly = msg.fileUrl && !textContent && !renderableImage && isAudioMessage(msg);
          const isImageOnly = !!renderableImage && !textContent && !isAudioMessage(msg);
          const prevMsgIsImageOnly = !!prevMsg && !!getRenderableImage(prevMsg) && (!prevMsg.text || prevMsg.text.trim() === "") && !isAudioMessage(prevMsg);

          // For border radius
          let borderRadiusClass = "rounded-2xl";
          if (isMe) {
            if (isConsecutiveWithPrev && isConsecutiveWithNext) borderRadiusClass = "rounded-2xl rounded-tr-[4px] rounded-br-[4px]";
            else if (isConsecutiveWithPrev) borderRadiusClass = "rounded-2xl rounded-tr-[4px]";
            else if (isConsecutiveWithNext) borderRadiusClass = "rounded-2xl rounded-br-[4px]";
          } else {
            if (isConsecutiveWithPrev && isConsecutiveWithNext) borderRadiusClass = "rounded-2xl rounded-tl-[4px] rounded-bl-[4px]";
            else if (isConsecutiveWithPrev) borderRadiusClass = "rounded-2xl rounded-tl-[4px]";
            else if (isConsecutiveWithNext) borderRadiusClass = "rounded-2xl rounded-bl-[4px]";
          }

          if (isConsecutiveWithPrev && isImageOnly && prevMsgIsImageOnly) {
            return null; // Skip rendering here, it is rendered in the grid of the first image
          }

          let imageSequence = [];
          if (isImageOnly) {
            imageSequence.push(msg);
            let currIdx = index + 1;
            while (currIdx < customer.chatHistory.length) {
              const nextM = customer.chatHistory[currIdx];
              const prevM = customer.chatHistory[currIdx - 1];
              const nextMTextContent = nextM.text ? nextM.text.trim() : "";
              const nextMIsImageOnly = !!getRenderableImage(nextM) && !nextMTextContent && !isAudioMessage(nextM);
              const isConsecutive = nextM.sender === msg.sender && (new Date(nextM.timestamp).getTime() - new Date(prevM.timestamp).getTime() < 5 * 60000);

              if (isConsecutive && nextMIsImageOnly) {
                imageSequence.push(nextM);
                currIdx++;
              } else {
                break;
              }
            }
          }

          return (
            <div key={msg.id} className={`flex w-full items-start ${isSelectingMultiple ? "gap-3" : ""}`}>
              {isSelectingMultiple && (
                <div className="shrink-0 flex items-center justify-center pt-[10px] w-6">
                  <div
                    onClick={() => {
                      if (selectedMessageIds.includes(msg.id)) {
                        setSelectedMessageIds(prev => prev.filter(id => id !== msg.id));
                      } else {
                        setSelectedMessageIds(prev => [...prev, msg.id]);
                      }
                    }}
                    className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors ${selectedMessageIds.includes(msg.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                  >
                    {selectedMessageIds.includes(msg.id) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    )}
                  </div>
                </div>
              )}
              <div id={`message-${msg.id}`} className={`group flex gap-2.5 max-w-[85%] relative ${isMe ? "ml-auto flex-row-reverse text-right" : "mr-auto"} ${isConsecutiveWithPrev ? "mt-[2px]" : "mt-3"}`}>
                {!isMe && (
                  <div className="w-7 shrink-0 flex flex-col justify-start">
                    {!isConsecutiveWithPrev && (
                      <img src={customer.avatar} alt={customer.name} className="w-7 h-7 rounded-full object-cover border border-sky-100" referrerPolicy="no-referrer" onError={(e) => handleAvatarError(e, customer.name)} />
                    )}
                  </div>
                )}

                {/* Hover actions & timestamp */}
                <div className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${isMe ? "right-full mr-2 flex-row-reverse" : "left-full ml-2"}`}>
                  <div className="flex items-center bg-gray-100/90 rounded-md shadow-sm p-1 text-gray-500 gap-1 border border-gray-200">
                    <button
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Trả lời"
                      onClick={() => setReplyingTo(msg)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v3.5" /></svg>
                    </button>
                    <button
                      onClick={() => handleTogglePinMessage(customer.id, msg.id)}
                      className={`p-1 hover:bg-gray-200 rounded transition-colors ${msg.isPinned ? "text-amber-500" : "text-slate-500"}`}
                      title={msg.isPinned ? "Bỏ ghim" : "Ghim"}
                    >
                      <Pin className="w-[14px] h-[14px]" strokeWidth={2} fill={msg.isPinned ? "currentColor" : "none"} />
                    </button>
                    <Popover
                      content={getMessageMoreOptionsContent(msg)}
                      trigger="click"
                      placement="bottom"
                      styles={{ content: { padding: 0, borderRadius: '8px', overflow: 'hidden' } }}
                    >
                      <button className="p-1 hover:bg-gray-200 rounded text-slate-500" title="Thêm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
                      </button>
                    </Popover>
                  </div>
                  <span className="text-[11px] text-gray-500 whitespace-nowrap">
                    {new Date(msg.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} {new Date(msg.timestamp).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                  </span>
                </div>

                <div className="relative">
                  {isVoiceOnly ? (
                    <VoicePlayer url={msg.fileUrl!} fileName={msg.fileName} />
                  ) : isImageOnly ? (
                    <div className={`flex flex-wrap gap-[2px] max-w-[240px] ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {imageSequence.map((imgMsg) => (
                        <div key={imgMsg.id} className="bg-white border border-gray-100 shadow-sm p-0.5 rounded-2xl overflow-hidden shrink-0">
                          <img src={getRenderableImage(imgMsg)!} alt="Media" className={`${imageSequence.length === 1 ? 'max-w-[200px]' : 'max-w-[115px]'} h-auto object-contain block rounded-[14px]`} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className={`px-3.5 py-2 text-[14px] shadow-sm text-left break-words ${isMe
                        ? "bg-[#dcf8c6] text-slate-800"
                        : "bg-white text-slate-800"
                        } ${borderRadiusClass}`}
                    >
                      {msg.replyTo && (
                        <div
                          className={`mb-1.5 flex flex-col border-l-[3px] rounded-r-md pl-2 pr-2 py-1 cursor-pointer transition-colors ${isMe ? "border-[#4ade80] bg-[#c5e5b4]/60 hover:bg-[#c5e5b4]" : "border-blue-500 bg-gray-100 hover:bg-gray-200"
                            }`}
                          onClick={() => {
                            const el = document.getElementById(`message-${msg.replyTo?.messageId}`);
                            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                        >
                          <span className={`font-semibold text-[13px] truncate ${isMe ? 'text-green-800' : 'text-blue-600'}`}>
                            {msg.replyTo.senderName}
                          </span>
                          <span className="text-[12px] text-gray-600 truncate opacity-90">
                            {msg.replyTo.text}
                          </span>
                        </div>
                      )}
                      {msg.text && <p className="whitespace-pre-wrap leading-[1.4]">{msg.text}</p>}
                      {renderableImage && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-sky-100">
                          <img src={renderableImage} alt="Media" className="max-w-[180px] max-h-[140px] object-cover" />
                        </div>
                      )}
                      {msg.fileUrl && !renderableImage && (
                        isAudioMessage(msg) ? (
                          <div className="mt-2">
                            <VoicePlayer url={msg.fileUrl} fileName={msg.fileName} />
                          </div>
                        ) : (
                          <div className="mt-2 p-2 rounded-md border border-sky-100 bg-sky-50/50 flex items-center gap-2 max-w-[240px] shadow-sm">
                            <div className="p-1.5 rounded bg-sky-500 text-white flex items-center justify-center shrink-0">
                              <Paperclip className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold text-slate-700 truncate" title={msg.fileName || "File đính kèm"}>
                                {msg.fileName || "File đính kèm"}
                              </p>
                              <p className="text-[9px] text-slate-400">
                                {msg.fileSize ? `${(msg.fileSize / 1024).toFixed(1)} KB` : msg.fileType || "Tài liệu"}
                              </p>
                            </div>
                            <a
                              href={msg.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-600 hover:text-sky-700 font-bold text-[10px] hover:underline shrink-0"
                            >
                              Mở file
                            </a>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {typingState && (
          <div className="flex gap-2.5 mr-auto">
            <img src={customer.avatar} alt={customer.name} className="w-7 h-7 rounded-full object-cover self-end shrink-0 border border-sky-100" referrerPolicy="no-referrer" onError={(e) => handleAvatarError(e, customer.name)} />
            <div className="bg-white border border-sky-100 text-slate-400 px-3 py-2 text-xs rounded-2xl rounded-bl-sm flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 bg-sky-300 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-sky-300 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-sky-300 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {isSelectingMultiple && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div
              onClick={() => {
                const selectableMessages = customer.chatHistory.filter(m => m.sender !== 'system');
                if (selectedMessageIds.length === selectableMessages.length) {
                  setSelectedMessageIds([]);
                } else {
                  setSelectedMessageIds(selectableMessages.map(m => m.id));
                }
              }}
              className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center cursor-pointer transition-colors ${selectedMessageIds.length > 0 && selectedMessageIds.length === customer.chatHistory.filter(m => m.sender !== 'system').length ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
            >
              {selectedMessageIds.length > 0 && selectedMessageIds.length === customer.chatHistory.filter(m => m.sender !== 'system').length && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              )}
            </div>
            <span className="text-[14px] text-gray-700 font-medium">Chọn tất cả</span>
            {selectedMessageIds.length > 0 && (
              <span className="text-[13px] text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 font-medium">{selectedMessageIds.length} đã chọn</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <button
              className="text-slate-600 hover:text-blue-600 transition-colors"
              title="In mỗi tin 1 trang"
              onClick={() => {
                const msgsToPrint = customer.chatHistory.filter(m => selectedMessageIds.includes(m.id));
                if (msgsToPrint.length > 0) handlePrintMessages(msgsToPrint, true);
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
            </button>
            <button
              className="text-slate-600 hover:text-blue-600 transition-colors"
              title="In tất cả tin 1 trang"
              onClick={() => {
                const msgsToPrint = customer.chatHistory.filter(m => selectedMessageIds.includes(m.id));
                if (msgsToPrint.length > 0) handlePrintMessages(msgsToPrint, false);
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 2h4.5L20 6.5V16a2 2 0 0 1-2 2" />
                <polyline points="15 2 15 7 20 7" />
                <path d="M5 6h4.5L14 10.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                <polyline points="9 6 9 11 14 11" />
                <line x1="7" y1="15" x2="12" y2="15" />
                <line x1="7" y1="18" x2="12" y2="18" />
              </svg>
            </button>
            <div className="w-[1px] h-5 bg-gray-300"></div>
            <button
              className="hover:text-red-600 transition-colors"
              onClick={() => {
                setIsSelectingMultiple(false);
                setSelectedMessageIds([]);
              }}
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col bg-[#f0f2f5] border-t border-gray-200 shrink-0 select-none">
        <div className="flex border-b border-gray-200 bg-[#e4e1de]">
          {tags.map((tag: any) => {
            const tagId = tag._id || tag.id;
            const isChecked = customer.tags.includes(tagId);
            let bgColor = "#3b82f6";
            if (tag.color) {
              if (tag.color.startsWith("#")) bgColor = tag.color;
              else if (tag.color.includes("emerald")) bgColor = "#10b981";
              else if (tag.color.includes("pink")) bgColor = "#ec4899";
              else if (tag.color.includes("amber")) bgColor = "#f59e0b";
              else if (tag.color.includes("purple")) bgColor = "#a855f7";
              else if (tag.color.includes("rose")) bgColor = "#f43f5e";
            }

            return (
              <button
                key={tagId}
                onClick={() => handleTagToggle(tagId)}
                className="relative flex-1 text-white py-1.5 text-[11px] font-semibold transition-all duration-200 flex items-center justify-center"
                style={{ backgroundColor: bgColor }}
                title={tag.name}
              >
                {isChecked && (
                  <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-white shrink-0 shadow-sm" />
                )}
                {tag.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col bg-white p-2">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded shrink-0 overflow-hidden border border-gray-100 mt-1">
                <img src="https://ui-avatars.com/api/?name=Hupunacake&background=fff&color=3b5998" alt="Page" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 relative">
                {showQuickReplies && filteredQuickReplies.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-2 w-[600px] max-w-full bg-white border border-gray-200 rounded-t-lg shadow-[0_0_15px_rgba(0,0,0,0.1)] z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white">
                      <div className="flex items-center gap-2 text-[#4b5563] text-[14px]">
                        <div className="w-4 h-4 rounded-full bg-[#1890ff] text-white flex items-center justify-center font-serif italic font-bold text-[11px] shrink-0">i</div>
                        <span>Nhấn <strong>Enter</strong> hoặc <strong>Click</strong> chuột để chọn mẫu câu, nhấn phím <strong>↓</strong> <strong>↑</strong> để điều hướng</span>
                      </div>
                      <button className="text-gray-500 hover:text-gray-700 ml-2" onClick={() => setShowQuickReplies(false)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {workspaceSettings?.quickReplySettings?.enableTopics ? (
                        <>
                          {quickReplyTopics.map(topic => {
                            const repliesInTopic = filteredQuickReplies.filter(qr => qr.topicId === topic.id);
                            if (repliesInTopic.length === 0) return null;
                            return (
                              <div key={topic.id}>
                                <div className="bg-gray-50/80 px-4 py-1.5 text-[11px] font-semibold sticky top-0 border-b border-gray-100 flex items-center gap-1.5" style={{ color: topic.color }}>
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: topic.color }}></div>
                                  {topic.name}
                                </div>
                                {repliesInTopic.map((qr) => {
                                  const idx = filteredQuickReplies.indexOf(qr);
                                  return (
                                    <div
                                      key={qr.id}
                                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0 ${idx === selectedQRIndex ? 'bg-[#e6f4ff]' : 'bg-white hover:bg-gray-50'}`}
                                      onClick={() => insertQuickReply(qr.text)}
                                      onMouseEnter={() => setSelectedQRIndex(idx)}
                                    >
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 mt-0.5 shrink-0"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /><path d="M8 10h8" /><path d="M8 14h8" /></svg>
                                      <div className="text-[14px] text-[#1f2937] flex-1">{qr.text}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                          {filteredQuickReplies.filter(qr => !qr.topicId).length > 0 && (
                            <div>
                              <div className="bg-gray-50/80 px-4 py-1.5 text-[11px] font-semibold text-gray-500 sticky top-0 border-b border-gray-100 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>Khác
                              </div>
                              {filteredQuickReplies.filter(qr => !qr.topicId).map((qr) => {
                                const idx = filteredQuickReplies.indexOf(qr);
                                return (
                                  <div
                                    key={qr.id}
                                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0 ${idx === selectedQRIndex ? 'bg-[#e6f4ff]' : 'bg-white hover:bg-gray-50'}`}
                                    onClick={() => insertQuickReply(qr.text)}
                                    onMouseEnter={() => setSelectedQRIndex(idx)}
                                  >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 mt-0.5 shrink-0"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /><path d="M8 10h8" /><path d="M8 14h8" /></svg>
                                    <div className="text-[14px] text-[#1f2937] flex-1">{qr.text}</div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        filteredQuickReplies.map((qr, idx) => (
                          <div
                            key={qr.id}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 last:border-0 ${idx === selectedQRIndex ? 'bg-[#e6f4ff]' : 'bg-white hover:bg-gray-50'}`}
                            onClick={() => insertQuickReply(qr.text)}
                            onMouseEnter={() => setSelectedQRIndex(idx)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 mt-0.5 shrink-0"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /><path d="M8 10h8" /><path d="M8 14h8" /></svg>
                            <div className="text-[14px] text-[#1f2937] flex-1">{qr.text}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Pending attachments preview */}
                {pendingAttachments.length > 0 && (
                  <div className="flex gap-2 p-2 overflow-x-auto bg-gray-50 border-b border-gray-100 rounded-t-lg">
                    {pendingAttachments.map((attachment) => {
                      const meta = getAttachmentMeta(attachment);
                      const isImage = meta.category === "image";

                      return (
                      <div key={attachment.id} className="relative w-16 h-16 rounded border border-gray-200 bg-white shrink-0 group">
                        {isImage ? (
                          <img src={attachment.url} alt={meta.name} className="w-full h-full object-cover rounded" />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded bg-white px-1 text-slate-500">
                            {renderAttachmentIcon(meta.category)}
                            <span className="w-full truncate text-center text-[10px] leading-none">{meta.name}</span>
                          </div>
                        )}
                        <button
                          onClick={() => setPendingAttachments(prev => prev.filter(a => a.id !== attachment.id))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full shadow border border-gray-200 text-gray-500 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                      </div>
                      );
                    })}
                  </div>
                )}

                {replyingTo && (
                  <div className="flex items-center mx-2 mt-2 gap-2 mb-1">
                    <div className="flex items-center justify-center text-gray-800 ml-1">
                      <CornerUpLeft className="w-[18px] h-[18px]" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 flex border-l-[4px] border-[#3b82f6] bg-[#f0f2f5] rounded-r-md pl-3 pr-2 py-2 justify-between">
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-[14px] text-gray-800 truncate">
                          {replyingTo.sender === 'customer' ? customer.name : (customer.pageName || 'Hupunacake')}
                        </span>
                        <span className="text-[13px] text-gray-500 truncate mt-0.5">
                          {replyingTo.text || (replyingTo.messageType === 'image' ? '[Hình ảnh]' : '[File đính kèm]')}
                        </span>
                      </div>
                      <button
                        className="text-gray-500 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md p-1 ml-2 shrink-0 self-center transition-colors"
                        onClick={() => setReplyingTo(null)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <Textarea
                  ref={inputRef}
                  rows={1}
                  className="w-full p-1.5 resize-none max-h-24 min-h-[36px] no-scrollbar overflow-y-auto bg-transparent border-0 focus:ring-0 text-sm shadow-none"
                  placeholder={`Trả lời từ ${customer.pageName || "Facebook Page"}`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-200 pt-2 px-1 pb-1">
              <div className="text-[#b0b3b8] hover:text-blue-500 cursor-pointer transition-colors" title="Trợ giúp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 19H11V17H13V19ZM15.07 11.25L14.17 12.17C13.45 12.9 13 13.5 13 15H11V14.5C11 13.4 11.45 12.4 12.17 11.67L13.41 10.41C13.78 10.05 14 9.55 14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9H8C8 6.79 9.79 5 12 5C14.21 5 16 6.79 16 9C16 9.88 15.64 10.68 15.07 11.25Z" />
                </svg>
              </div>

              <div className="flex items-center gap-3.5 text-[#b0b3b8]">
                <div className="hover:text-blue-500 cursor-pointer transition-colors" title="Ghi âm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" /></svg>
                </div>

                <div className="relative hover:text-blue-500 cursor-pointer transition-colors" title="Sản phẩm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6.5l-5.66-2.5c-.71-.31-1.53.07-1.75.83L13 7c0 .55-.45 1-1 1s-1-.45-1-1l-.59-2.17c-.22-.76-1.04-1.14-1.75-.83L3 6.5C2.4 6.77 2 7.36 2 8v3.5c0 1.1.9 2 2 2h2v7c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-7h2c1.1 0 2-.9 2-2V8c0-.64-.4-1.23-1-1.5z" /></svg>
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                </div>

                <div className="hover:text-blue-500 cursor-pointer transition-colors" title="Nhãn dán">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10l6-6V5c0-1.1-.9-2-2-2zm-1 14h-3v3.5L18 17z" /></svg>
                </div>

                {/* Video and documents */}
                <Popover
                  content={filePopoverContent}
                  trigger="click"
                  open={isFilePopoverOpen}
                  onOpenChange={setIsFilePopoverOpen}
                  placement="top"
                  styles={{ content: { padding: 0, borderRadius: 8 } }}
                >
                  <div className="relative hover:text-blue-500 cursor-pointer transition-colors" title="Video và Tài liệu">
                    <Paperclip className="h-5 w-5" strokeWidth={2.2} />
                    {fileAttachments.length > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                        {fileAttachments.length}
                      </span>
                    )}
                  </div>
                </Popover>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={FILE_ATTACHMENT_ACCEPT}
                  className="hidden"
                  onChange={handleSelectDocumentFiles}
                />

                {/* Images */}
                <div onClick={() => setIsGalleryOpen(true)} className="hover:text-blue-500 cursor-pointer transition-colors" title="Gửi ảnh">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" /></svg>
                </div>

                {/* Message Quick Reply */}
                <Popover
                  content={quickReplyPopoverContent}
                  trigger="click"
                  open={showQuickReplyPopover}
                  onOpenChange={setShowQuickReplyPopover}
                  placement="top"
                  styles={{ content: { padding: 0, borderRadius: '8px', overflow: 'hidden' } }}
                >
                  <div className="hover:text-blue-500 cursor-pointer transition-colors" title="Câu trả lời nhanh">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" /></svg>
                  </div>
                </Popover>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() && pendingAttachments.length === 0}
                  className="ml-1 disabled:opacity-40 text-[#b0b3b8] hover:text-blue-500 transition-colors"
                  title="Gửi"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOrderCreatorOpen && (
        <OrderCreator
          customer={customer}
          onClose={() => setIsOrderCreatorOpen(false)}
          onCreateOrder={(order) => {
            handleCreateOrder(order);
            setIsOrderCreatorOpen(false);
          }}
        />
      )}

      <ImageGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={(images) => {
          setPendingAttachments(prev => [...prev, ...images]);
        }}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        initialText={reminderMessageText}
        customerName={customer.name}
      />

      <Modal
        open={isBirthdayModalOpen}
        onCancel={() => setIsBirthdayModalOpen(false)}
        footer={null}
        closable={false}
        centered
        width={580}
        styles={{
          body: { padding: 0 },
        }}
      >
        <div className="bg-white px-7 pb-4 pt-6 text-slate-800">
          <div className="mb-10 flex items-center justify-between">
            <h3 className="text-[18px] font-bold text-slate-900">Ngày sinh</h3>
            <button
              type="button"
              onClick={() => setIsBirthdayModalOpen(false)}
              className="rounded-full p-1 text-slate-400 transition hover:text-slate-700"
              title="Đóng"
            >
              <X className="h-5 w-5" strokeWidth={1.6} />
            </button>
          </div>

          <div className="grid grid-cols-[180px_1fr]">
            <div className="space-y-3.5 border-r border-slate-100 pr-7">
              <label className="block text-[16px] font-normal text-slate-800">
                <span>Ngày</span>
                <div className="relative mt-2">
                  <select
                    value={selectedBirthdayDate.getDate()}
                    onChange={(event) => handleSelectBirthdayDay(Number(event.target.value))}
                    className="h-[38px] w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-9 text-[15px] text-slate-700 outline-none transition focus:border-blue-400"
                  >
                    {Array.from(
                      { length: getDaysInMonth(selectedBirthdayDate.getFullYear(), selectedBirthdayDate.getMonth()) },
                      (_, index) => index + 1
                    ).map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" strokeWidth={1.8} />
                </div>
              </label>

              <label className="block text-[16px] font-normal text-slate-800">
                <span>Tháng</span>
                <div className="relative mt-2">
                  <select
                    value={selectedBirthdayDate.getMonth()}
                    onChange={(event) => handleSelectBirthdayMonth(Number(event.target.value))}
                    className="h-[38px] w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-9 text-[15px] text-slate-700 outline-none transition focus:border-blue-400"
                  >
                    {Array.from({ length: 12 }, (_, index) => (
                      <option key={index} value={index}>
                        Tháng {index + 1}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" strokeWidth={1.8} />
                </div>
              </label>

              <label className="block text-[16px] font-normal text-slate-800">
                <span>Năm</span>
                <div className="relative mt-2">
                  <select
                    value={selectedBirthdayDate.getFullYear()}
                    onChange={(event) => handleSelectBirthdayYear(Number(event.target.value))}
                    className="h-[38px] w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-9 text-[15px] text-slate-700 outline-none transition focus:border-blue-400"
                  >
                    {birthdayYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" strokeWidth={1.8} />
                </div>
              </label>
            </div>

            <div className="pl-8">
              <div className="mb-3.5 flex items-center justify-between text-[14px] font-semibold text-slate-950">
                <button
                  type="button"
                  onClick={() => handleMoveBirthdayMonth(-12)}
                  className="rounded px-1.5 py-1 text-slate-500 transition hover:text-slate-700"
                  title="Năm trước"
                >
                  {"<<"}
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveBirthdayMonth(-1)}
                  className="rounded px-1.5 py-1 text-slate-500 transition hover:text-slate-700"
                  title="Tháng trước"
                >
                  {"<"}
                </button>
                <span>
                  tháng {selectedBirthdayDate.getMonth() + 1} - {selectedBirthdayDate.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() => handleMoveBirthdayMonth(1)}
                  className="rounded px-1.5 py-1 text-slate-500 transition hover:text-slate-700"
                  title="Tháng sau"
                >
                  {">"}
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveBirthdayMonth(12)}
                  className="rounded px-1.5 py-1 text-slate-500 transition hover:text-slate-700"
                  title="Năm sau"
                >
                  {">>"}
                </button>
              </div>

              <div className="grid grid-cols-7 gap-y-2.5 text-center text-[13px]">
                {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((weekday) => (
                  <div key={weekday} className="font-bold text-slate-900">
                    {weekday}
                  </div>
                ))}
                {birthdayCalendarCells.map((cell) => {
                  const cellValue = formatBirthdayValue(cell.date);
                  const isSelected = cellValue === selectedBirthdayValue;

                  return (
                    <button
                      key={cellValue}
                      type="button"
                      onClick={() => setSelectedBirthdayDate(cell.date)}
                      className={`mx-auto flex h-8 w-8 items-center justify-center rounded-md text-[13px] transition ${
                        isSelected
                          ? "bg-blue-500 font-semibold text-white"
                          : cell.isCurrentMonth
                            ? "text-slate-900 hover:bg-blue-50 hover:text-blue-600"
                            : "text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {cell.date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-7 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsBirthdayModalOpen(false)}
              className="h-[38px] rounded-md bg-slate-100 px-5 text-[14px] font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSaveBirthday}
              disabled={!hasBirthdayChanged}
              className={`h-[38px] rounded-md px-5 text-[14px] font-semibold transition ${
                hasBirthdayChanged
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "cursor-not-allowed bg-blue-100 text-blue-300"
              }`}
            >
              Lưu
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isConversationHistoryOpen}
        onCancel={() => setIsConversationHistoryOpen(false)}
        footer={null}
        closable={false}
        centered
        width={650}
        styles={{
          body: { padding: 0 },
        }}
      >
        <div className="flex h-[590px] max-h-[78vh] flex-col bg-white text-slate-800">
          <div className="flex items-center justify-between px-7 py-6">
            <h3 className="text-[19px] font-bold text-slate-900">Lịch sử cập nhật hội thoại</h3>
            <button
              type="button"
              onClick={() => setIsConversationHistoryOpen(false)}
              className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              title="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex border-b border-slate-100 px-7">
            <button
              type="button"
              onClick={() => setConversationHistoryTab("tags")}
              className={`mr-8 border-b-2 px-2 pb-4 text-[16px] font-semibold transition ${
                conversationHistoryTab === "tags"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-700 hover:text-blue-600"
              }`}
            >
              Thẻ hội thoại
            </button>
            <button
              type="button"
              onClick={() => setConversationHistoryTab("assignee")}
              className={`border-b-2 px-2 pb-4 text-[16px] font-medium transition ${
                conversationHistoryTab === "assignee"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-700 hover:text-blue-600"
              }`}
            >
              Phân công nhân viên
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-7 py-5">
            {conversationHistoryTab === "tags" ? (
              tagHistoryItems.length > 0 ? (
                <>
                  <div className="mb-3 text-[15px] font-medium text-slate-600">
                    {formatHistoryDate(tagHistoryItems[0].timestamp)}
                  </div>
                  <div className="space-y-1">
                    {tagHistoryItems.map((item, index) => (
                      <div key={item.id} className="flex gap-3 py-2">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.actor)}&background=e5e7eb&color=94a3b8`}
                          alt={item.actor}
                          className="mt-1 h-6 w-6 rounded-full object-cover"
                        />
                        <div className="relative flex-1 pb-3">
                          {index < tagHistoryItems.length - 1 && (
                            <span className="absolute -left-6 top-9 bottom-[-10px] w-px bg-slate-200" />
                          )}
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-[15px] font-bold text-slate-800">{item.actor}</div>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-[15px] text-slate-700">
                                <TagIcon
                                  className={`h-4 w-4 ${
                                    item.actionTone === "add" ? "text-emerald-600" : "text-rose-500"
                                  }`}
                                  fill="currentColor"
                                />
                                <span>{item.actionText}</span>
                                <span
                                  className="rounded px-2 py-1 text-[13px] font-semibold leading-none text-white"
                                  style={{ backgroundColor: item.tagColor }}
                                >
                                  {item.tagName}
                                </span>
                              </div>
                            </div>
                            <span className="shrink-0 text-[15px] text-slate-500">
                              {formatHistoryTime(item.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-[15px] text-slate-400">
                  Chưa có lịch sử thẻ hội thoại
                </div>
              )
            ) : assignmentHistoryItems.length > 0 ? (
              <>
                <div className="mb-3 text-[15px] font-medium text-slate-600">
                  {formatHistoryDate(assignmentHistoryItems[0].timestamp)}
                </div>
                {assignmentHistoryItems.map((item) => (
                  <div key={item.id} className="flex gap-3 py-2">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.actor)}&background=e5e7eb&color=94a3b8`}
                      alt={item.actor}
                      className="mt-1 h-6 w-6 rounded-full object-cover"
                    />
                    <div className="flex-1 pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-[15px] font-bold text-slate-800">{item.actor}</div>
                          <div className="mt-2 text-[15px] text-slate-700">
                            Đã phân công cho{" "}
                            <span className="font-semibold text-slate-900">{item.assigneeName}</span>
                          </div>
                        </div>
                        <span className="shrink-0 text-[15px] text-slate-500">
                          {formatHistoryTime(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-[15px] text-slate-400">
                Chưa có lịch sử phân công nhân viên
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        title={<span className="font-bold text-[16px]">Giả lập Tổng đài</span>}
        open={callModalOpen}
        onCancel={() => setCallModalOpen(false)}
        footer={null}
        centered
      >
        <div className="py-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
            <Phone className="w-8 h-8" />
          </div>
          <h3 className="text-[15px] font-medium mb-1">Đang gọi cho khách hàng...</h3>
          <p className="text-[18px] font-bold text-blue-600 mb-6">{customer?.name} ({customer?.phone})</p>

          <div className="flex gap-4 w-full">
            <button
              onClick={() => handleCallResult('fail')}
              className="flex-1 py-2.5 rounded-lg border border-red-200 bg-red-50 text-red-600 font-medium hover:bg-red-100 transition"
            >
              Không nghe máy
            </button>
            <button
              onClick={() => handleCallResult('success')}
              className="flex-1 py-2.5 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition"
            >
              Khách bắt máy
            </button>
          </div>
          <p className="text-[12px] text-gray-500 mt-4 text-center">
            *Thao tác này sẽ tự động gắn thẻ tương ứng theo cấu hình Thẻ tổng đài trong phần Cài đặt.
          </p>
        </div>
      </Modal>
    </div>
  );
}

interface VoicePlayerProps {
  url: string;
  fileName?: string;
}

function VoicePlayer({ url, fileName }: VoicePlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [playbackRate, setPlaybackRate] = React.useState(1);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const cycleSpeed = () => {
    if (!audioRef.current) return;
    let nextRate = 1;
    if (playbackRate === 1) nextRate = 1.5;
    else if (playbackRate === 1.5) nextRate = 2;
    else if (playbackRate === 2) nextRate = 1;

    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatAudioTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm w-full max-w-[270px] select-none text-slate-800">
      <style>{`
        .voice-slider {
          -webkit-appearance: none !important;
          appearance: none !important;
          height: 3px !important;
          margin: 0 !important;
          padding: 0 !important;
          outline: none !important;
          border-radius: 9999px !important;
        }
        .voice-slider::-webkit-slider-runnable-track {
          background: transparent !important;
          border: none !important;
        }
        .voice-slider::-webkit-slider-thumb {
          -webkit-appearance: none !important;
          appearance: none !important;
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background: #3b82f6 !important;
          cursor: pointer !important;
          border: none !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15) !important;
          margin-top: -2.5px !important;
        }
        .voice-slider::-moz-range-track {
          background: transparent !important;
          border: none !important;
        }
        .voice-slider::-moz-range-thumb {
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background: #3b82f6 !important;
          cursor: pointer !important;
          border: none !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15) !important;
        }
      `}</style>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
      />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-600 transition shrink-0 cursor-pointer shadow-sm"
      >
        {isPlaying ? (
          <svg className="w-3 h-3 fill-blue-600" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="w-3 h-3 fill-blue-600 ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Slider */}
      <input
        type="range"
        min={0}
        max={duration || 100}
        value={currentTime}
        onChange={handleSeek}
        className="voice-slider flex-1 rounded-full cursor-pointer outline-none"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / (duration || 1)) * 100}%, #e5e7eb ${(currentTime / (duration || 1)) * 100}%, #e5e7eb 100%)`
        }}
      />

      {/* Time */}
      <span className="text-[10px] text-slate-500 font-mono shrink-0 select-none">
        {formatAudioTime(currentTime)}
      </span>

      {/* Speed Button */}
      <button
        onClick={cycleSpeed}
        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-bold text-slate-600 min-w-[24px] text-center transition cursor-pointer font-sans select-none"
      >
        {playbackRate}x
      </button>

      {/* Download Icon */}
      <a
        href={url}
        download={fileName || "voice.mp3"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-slate-400 hover:text-slate-600 transition shrink-0 p-1 hover:bg-slate-50 rounded-full"
        title="Tải xuống"
      >
        <svg className="w-3.5 h-3.5 stroke-slate-500 fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </a>
    </div>
  );
}
