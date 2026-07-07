"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import type {
  ConversationFilters,
  Customer,
  Message,
  Order,
  QuickReply,
  QuickReplyTopic,
} from "@/types";
import { INITIAL_CUSTOMERS } from "@/data/mockData";
import type { SafeUser } from "@/types/user";
import { notification } from "antd";

interface FacebookSyncState {
  isSyncing: boolean;
  autoSyncEnabled: boolean;
  lastSyncedAt: string;
  lastSyncError: string;
  lastSyncCount: number;
}

interface AppContextValue {
  user: SafeUser | null;
  customers: Customer[];
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  activeShopName: string;
  setActiveShopName: (name: string) => void;
  orders: Order[];
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  unreadCountSum: number;
  handleSendMessage: (text: string, isQuickReply?: boolean, attachments?: any[], replyTo?: any) => void;
  handleTogglePinMessage: (customerId: string, msgId: string) => Promise<void>;
  handleUpdateCustomerTags: (customerId: string, updatedTagIds: string[]) => void;
  handleUpdateCustomerDetails: (
    customerId: string,
    fields: Partial<Customer>
  ) => void;
  handleSelectCustomer: (id: string) => void;
  handleCreateOrder: (order: Order) => void;
  workspaceSettings: any;
  updateWorkspaceSettings: (settings: any) => Promise<void>;
  quickReplies: QuickReply[];
  refreshQuickReplies: () => Promise<void>;
  quickReplyTopics: QuickReplyTopic[];
  refreshQuickReplyTopics: () => Promise<void>;
  connectedPages: any[];
  activePageId: string;
  setActivePageId: (id: string) => void;
  refreshConnectedPages: () => Promise<void>;
  triggerSync: (options?: { showNotification?: boolean }) => Promise<boolean>;
  facebookSyncState: FacebookSyncState;
  setAutoSyncEnabled: (enabled: boolean) => void;
  conversationFilters: ConversationFilters;
  setConversationFilters: Dispatch<SetStateAction<ConversationFilters>>;
  resetConversationFilters: () => void;
}

const DEFAULT_WORKSPACE_SETTINGS = {
  tagSettings: {
    allowMultiple: true,
    showFullName: true,
    filterMode: "AND",
    syncByCustomer: false,
    callCenter: { successTagId: "", failTagId: "" },
  },
  interfaceSettings: {
    showMainAssignee: false,
    showViewingAccount: false,
    showPageInfo: true,
  },
  quickReplySettings: {
    suggestQuickReply: true,
    sendImmediately: false,
    enableTopics: false,
    staffDetails: "",
  },
};

const DEFAULT_CONVERSATION_FILTERS: ConversationFilters = {
  channels: [],
  assigned: "all",
  starred: false,
  readStatus: "all",
  commentFilter: "all",
  messageFilter: "all",
  reviewStatus: "all",
  phone: "all",
  unreplied: false,
  duplicate: false,
  customerGroup: "all",
  dateFrom: "",
  dateTo: "",
};

function buildCustomerQueryParams(filters: ConversationFilters) {
  const params = new URLSearchParams();

  if (filters.channels.length > 0) {
    params.set("channels", filters.channels.join(","));
  }
  if (filters.readStatus !== "all") params.set("readStatus", filters.readStatus);
  if (filters.commentFilter !== "all") {
    params.set("sourceType", "comment");
    params.set("commentFilter", filters.commentFilter);
  }
  if (filters.messageFilter !== "all") {
    params.set("sourceType", "inbox");
    params.set("messageFilter", filters.messageFilter);
  }
  if (filters.reviewStatus !== "all") {
    params.set("reviewStatus", filters.reviewStatus);
  }
  if (filters.assigned !== "all") params.set("assigned", filters.assigned);
  if (filters.starred) params.set("starred", "true");
  if (filters.phone !== "all") params.set("phone", filters.phone);
  if (filters.unreplied) params.set("unreplied", "true");
  if (filters.duplicate) params.set("duplicate", "true");
  if (filters.customerGroup !== "all") {
    params.set("customerGroup", filters.customerGroup);
  }
  if (filters.dateFrom) params.set("from", filters.dateFrom);
  if (filters.dateTo) params.set("to", filters.dateTo);

  return params.toString();
}

const AppContext = createContext<AppContextValue | null>(null);

function getAttachmentMessageType(attachment: any): Message["messageType"] {
  const fileType = attachment.file?.type || attachment.fileType || "";
  const fileName = attachment.file?.name || attachment.name || "";

  if (fileType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName)) return "image";
  if (fileType.startsWith("video/") || /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(fileName)) return "video";
  if (fileType.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(fileName)) return "audio";
  return "file";
}

function getAttachmentSummary(attachments: any[]) {
  if (attachments.length === 0) return "";
  if (attachments.every((attachment) => getAttachmentMessageType(attachment) === "image")) return "[Hình ảnh]";

  const firstType = getAttachmentMessageType(attachments[0]);
  if (firstType === "video") return "[Video]";
  if (firstType === "audio") return "[Âm thanh]";
  return "[File đính kèm]";
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

interface AppProviderProps {
  user: SafeUser | null;
  children: ReactNode;
}

export function AppProvider({ user, children }: AppProviderProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("cust-1");
  const [activeShopName, setActiveShopName] = useState(
    "Bella Boutique (Thời Trang)"
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSimulating, setIsSimulating] = useState(true);
  const [workspaceSettings, setWorkspaceSettings] = useState<any>(DEFAULT_WORKSPACE_SETTINGS);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [quickReplyTopics, setQuickReplyTopics] = useState<QuickReplyTopic[]>([]);
  const [connectedPages, setConnectedPages] = useState<any[]>([]);
  const [activePageId, setActivePageId] = useState<string>("");
  const [conversationFilters, setConversationFilters] = useState<ConversationFilters>(
    DEFAULT_CONVERSATION_FILTERS
  );
  const syncInFlightRef = React.useRef(false);
  const [facebookSyncState, setFacebookSyncState] = useState<FacebookSyncState>({
    isSyncing: false,
    autoSyncEnabled: false,
    lastSyncedAt: "",
    lastSyncError: "",
    lastSyncCount: 0,
  });

  const refreshCustomers = useCallback(async () => {
    try {
      const query = buildCustomerQueryParams(conversationFilters);
      const res = await fetch(`/api/customers${query ? `?${query}` : ""}`);
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data)) {
        setCustomers(json.data);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    }
  }, [conversationFilters]);

  const resetConversationFilters = useCallback(() => {
    setConversationFilters(DEFAULT_CONVERSATION_FILTERS);
  }, []);

  const refreshConnectedPages = useCallback(async () => {
    try {
      const res = await fetch('/api/facebook/pages');
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data)) {
        setConnectedPages(json.data);
        const active = json.data.find((p: any) => p.isActive);
        if (active) {
          setActivePageId(active.pageId);
          setActiveShopName(active.pageName);
        }
      }
    } catch (e) {
      console.error("Failed to load connected pages:", e);
    }
  }, []);

  const refreshQuickReplies = useCallback(async () => {
    try {
      const res = await fetch('/api/quick_replies');
      const json = await res.json();
      if (json.success && json.data) {
        setQuickReplies(json.data);
      }
    } catch (e) {
      console.error("Failed to load quick replies:", e);
    }
  }, []);

  const refreshQuickReplyTopics = useCallback(async () => {
    try {
      const res = await fetch('/api/quick_reply_topics');
      const json = await res.json();
      if (json.success && json.data) {
        setQuickReplyTopics(json.data);
      }
    } catch (e) {
      console.error("Failed to load quick reply topics:", e);
    }
  }, []);

  // Load customers and workspace settings from DB on mount
  React.useEffect(() => {
    refreshCustomers();

    // Load Workspace Settings
    fetch('/api/settings/workspace_settings?workspaceId=65a123456789012345678901')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setWorkspaceSettings({
            tagSettings: { ...DEFAULT_WORKSPACE_SETTINGS.tagSettings, ...json.data.tagSettings },
            interfaceSettings: { ...DEFAULT_WORKSPACE_SETTINGS.interfaceSettings, ...json.data.interfaceSettings },
            generalSettings: json.data.generalSettings || {},
            quickReplySettings: { ...DEFAULT_WORKSPACE_SETTINGS.quickReplySettings, ...json.data.quickReplySettings }
          });
        }
      })
      .catch(err => console.error("Failed to load workspace settings:", err));

    refreshQuickReplies();
    refreshQuickReplyTopics();
    refreshConnectedPages();
  }, [refreshCustomers, refreshQuickReplies, refreshQuickReplyTopics, refreshConnectedPages]);

  React.useEffect(() => {
    const handleFacebookPagesUpdated = () => {
      refreshConnectedPages();
      refreshCustomers();
    };

    window.addEventListener("facebook-pages-updated", handleFacebookPagesUpdated);
    return () => {
      window.removeEventListener("facebook-pages-updated", handleFacebookPagesUpdated);
    };
  }, [refreshConnectedPages, refreshCustomers]);

  const updateWorkspaceSettings = useCallback(async (newSettings: any) => {
    try {
      const res = await fetch('/api/settings/workspace_settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: "65a123456789012345678901",
          ...newSettings
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setWorkspaceSettings((prev: any) => ({
          tagSettings: { ...prev.tagSettings, ...json.data.tagSettings },
          interfaceSettings: { ...prev.interfaceSettings, ...json.data.interfaceSettings },
          generalSettings: { ...prev.generalSettings, ...json.data.generalSettings },
          quickReplySettings: { ...prev.quickReplySettings, ...json.data.quickReplySettings }
        }));

        notification.success({
          message: <span className="text-[#107c2a] font-medium text-[15px]">Thành công</span>,
          description: <span className="text-slate-800 text-[14px]">Cài đặt đã được cập nhật</span>,
          style: {
            backgroundColor: "#f4fcf0",
            border: "1px solid #dcf0d0",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          },
          placement: 'top',
          duration: 3,
        });
      }
    } catch (err) {
      console.error("Failed to update workspace settings:", err);
    }
  }, []);

  const unreadCountSum = customers.reduce((acc, c) => acc + c.unreadCount, 0);

  const triggerBotReply = useCallback(
    (custId: string, lastUserMsg: string) => {
      if (!isSimulating) return;

      setTimeout(() => {
        setCustomers((prevCustomers) =>
          prevCustomers.map((cust) => {
            if (cust.id !== custId) return cust;

            let replyText = "";
            const msgLower = lastUserMsg.toLowerCase();

            if (cust.id === "cust-1") {
              if (
                msgLower.includes("sđt") ||
                msgLower.includes("số điện thoại") ||
                msgLower.includes("địa chỉ") ||
                msgLower.includes("/sdt")
              ) {
                replyText =
                  "SĐT em là 0912345678 nhé shop, ship về 15 Lê Lợi, Phường Bến Nghé, Quận 1, TP. HCM nha! Giao nhanh giùm em, em đang cần váy này đi tiệc cuối tuần ạ.";
              } else if (
                msgLower.includes("bao nhiêu") ||
                msgLower.includes("giá") ||
                msgLower.includes("/price")
              ) {
                replyText =
                  "Dạ 261k là được giảm rồi đúng không shop? Có được freeship không nhỉ, nếu freeship thì em chốt luôn!";
              } else {
                replyText =
                  "Dạ vâng váy màu này tôn da lắm đúng không shop? Chốt đơn này cho em nha, em đợi nhận hàng ạ. Cảm ơn shop yêu!";
              }
            } else if (cust.id === "cust-2") {
              if (
                msgLower.includes("cotton") ||
                msgLower.includes("phai") ||
                msgLower.includes("giặt") ||
                msgLower.includes("chất liệu")
              ) {
                replyText =
                  "Thế thì an tâm rồi, sợ nhất giặt mấy nước là xù lông cốt tông pha thui ạ. Đặt cho anh 1 Áo Thun Unisex Streetwear màu Đen size L nha. SĐT: 0399888123, ship về ngõ 10 Dịch Vọng, Cầu Giấy, Hà Nội nhé.";
              } else if (
                msgLower.includes("sđt") ||
                msgLower.includes("số điện thoại") ||
                msgLower.includes("/sdt")
              ) {
                replyText = "Số anh là 0399888123 nhé. Địa chỉ Quận Cầu Giấy, HN.";
              } else {
                replyText =
                  "Ok em, chăm sóc khách hàng nhiệt tình quá, anh sẽ đánh giá 5 sao!";
              }
            } else if (cust.id === "cust-3") {
              if (
                msgLower.includes("chuyển khoản") ||
                msgLower.includes("vcb") ||
                msgLower.includes("bill") ||
                msgLower.includes("/ck")
              ) {
                replyText =
                  "Dạ em ck thành công 420k rồi đó ạ. Shop check tài khoản xem nhận được tiền chưa nha, khi nào gửi hàng chụp mã vận đơn cho em nghen.";
              } else {
                replyText =
                  "Lần nào mua son bên shop cũng chuẩn chính hãng, dùng thích mê hà. Gửi sớm giùm chị Vy nhé cưng ơi.";
              }
            } else if (cust.id === "cust-4") {
              if (
                msgLower.includes("kính") ||
                msgLower.includes("miền trung") ||
                msgLower.includes("nắng")
              ) {
                replyText =
                  "Trông xịn xò quá ha. Đặt cho em 1 cái màu Trắng Chunky nha shop. Số em là 0888222333, giao về 244 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội nha shop.";
              } else {
                replyText = "Dạ vâng em cảm ơn shop nha, tư vấn chuẩn ghê!";
              }
            } else if (cust.id === "cust-5") {
              replyText =
                "Hic em xin lỗi nhiều ạ, tại em có việc đột xuất phải đi công tác gấp không có ai ở nhà nhận hàng hết trơn á. Lần sau em bù lại nha shop thương thương 🌸";
            } else {
              replyText =
                "Dạ vâng em cảm ơn shop đã tư vấn nhiệt tình nha. Để em xem thêm rồi báo shop chốt sau nha ❤️";
            }

            const botMsg: Message = {
              id: `msg-${Date.now()}-bot`,
              sender: "customer",
              text: replyText,
              timestamp: new Date(),
            };

            return {
              ...cust,
              lastMessage: replyText,
              timestamp: new Date(),
              unreadCount: cust.unreadCount + 1,
              chatHistory: [...cust.chatHistory, botMsg],
            };
          })
        );
      }, 1500);
    },
    [isSimulating]
  );

  const handleSendMessage = useCallback(
    async (text: string, isQuickReply: boolean = false, attachments: any[] = [], replyTo?: any) => {
      if (!selectedCustomerId) return;
      if (!text.trim() && attachments.length === 0) return;

      const customer = customers.find((c) => c.id === selectedCustomerId);
      if (!customer) return;

      const newMessages: Message[] = [];
      const timestamp = new Date();

      if (text.trim()) {
        const msgId = "msg-" + Date.now().toString() + "-text";
        newMessages.push({
          id: msgId,
          sender: "shop",
          messageType: "text",
          text,
          timestamp,
          isQuickReplyUsed: isQuickReply,
          replyTo: replyTo ? {
            messageId: replyTo.id,
            senderName: replyTo.sender === 'customer' ? customer.name : (customer.pageName || 'Hupunacake'),
            text: replyTo.text || (replyTo.messageType === 'image' ? '[Hình ảnh]' : '[File đính kèm]')
          } : undefined
        });
      }

      attachments.forEach((att, idx) => {
        const messageType = getAttachmentMessageType(att);
        const fileUrl = att.url;
        const fileName = att.name || att.file?.name;
        const fileType = att.fileType || att.file?.type;
        const fileSize = att.fileSize || att.file?.size;

        newMessages.push({
          id: `msg-${Date.now()}-shop-att-${idx}`,
          sender: "shop",
          messageType,
          text: "",
          image: messageType === "image" ? fileUrl : undefined,
          fileUrl: messageType === "image" ? undefined : fileUrl,
          fileName,
          fileType,
          fileSize,
          timestamp,
        });
      });

      if (newMessages.length === 0) return;

      const isMock = selectedCustomerId.startsWith("cust-");
      if (isMock) {
        const lastMessageText = text || getAttachmentSummary(attachments);

        setCustomers((prev) =>
          prev.map((cust) => {
            if (cust.id !== selectedCustomerId) return cust;
            return {
              ...cust,
              lastMessage: lastMessageText,
              timestamp: new Date(),
              unreadCount: 0,
              chatHistory: [...cust.chatHistory, ...newMessages],
            };
          })
        );

        if (text) triggerBotReply(selectedCustomerId, text);
      } else {
        try {
          const selectedCustomer = customers.find((cust) => cust.id === selectedCustomerId);
          const formData = new FormData();
          formData.append("conversationId", selectedCustomer?.id || selectedCustomerId);
          formData.append("pageId", selectedCustomer?.pageId || activePageId);
          formData.append("customerId", selectedCustomer?.facebookCustomerId || selectedCustomerId);
          if (text) formData.append("text", text);
          if (replyTo) {
            formData.append("replyTo", JSON.stringify({
              messageId: replyTo.id,
              senderName: replyTo.sender === 'customer' ? selectedCustomer?.name : (selectedCustomer?.pageName || 'Hupunacake'),
              text: replyTo.text || (replyTo.messageType === 'image' ? '[Hình ảnh]' : '[File đính kèm]')
            }));
          }
          
          attachments.forEach((att, idx) => {
            if (att.file) {
              formData.append(`file_${idx}`, att.file);
            } else if (att.url && !att.url.startsWith("blob:")) {
              formData.append(`url_${idx}`, att.url);
            }
          });

          const res = await fetch("/api/facebook/send-message", {
            method: "POST",
            body: formData,
          });
          const json = await res.json();
          if (json.success && json.data) {
            setCustomers((prev) =>
              prev.map((cust) => {
                if (cust.id === selectedCustomerId) {
                  return json.data;
                }
                return cust;
              })
            );
          } else {
            console.error("Facebook Send API Error:", json.error);
            notification.error({
              message: "Lỗi gửi tin nhắn",
              description: json.error || "Không thể gửi tin nhắn qua Facebook.",
            });
          }
        } catch (e) {
          console.error("Failed to send message via Facebook API:", e);
        }
      }
    },
    [activePageId, customers, selectedCustomerId, triggerBotReply]
  );

  const triggerSync = useCallback(async (options: { showNotification?: boolean } = {}) => {
    const showNotification = options.showNotification ?? true;
    if (syncInFlightRef.current) return false;

    syncInFlightRef.current = true;
    setFacebookSyncState((current) => ({
      ...current,
      isSyncing: true,
      lastSyncError: "",
    }));

    try {
      const res = await fetch("/api/facebook/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setFacebookSyncState((current) => ({
          ...current,
          lastSyncedAt: json.data.lastSyncedAt || new Date().toISOString(),
          lastSyncCount: json.data.syncCount || 0,
          lastSyncError: "",
        }));

        if (!showNotification) {
          await refreshCustomers();
          return true;
        }

        notification.success({
          message: "Đồng bộ thành công",
          description: `Đã đồng bộ ${json.data.syncCount} cuộc hội thoại từ Facebook.`,
        });

        await refreshCustomers();
        return true;
      } else {
        const errorMessage = json.error || "Cannot sync Facebook messages.";
        setFacebookSyncState((current) => ({
          ...current,
          lastSyncError: errorMessage,
        }));

        if (!showNotification) {
          return false;
        }

        notification.error({
          message: "Đồng bộ thất bại",
          description: json.error || "Không thể đồng bộ tin nhắn.",
        });
        return false;
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to sync conversations";
      setFacebookSyncState((current) => ({
        ...current,
        lastSyncError: errorMessage,
      }));
      console.error("Failed to sync conversations:", e);
      return false;
    } finally {
      syncInFlightRef.current = false;
      setFacebookSyncState((current) => ({
        ...current,
        isSyncing: false,
      }));
    }
  }, [refreshCustomers]);

  const setAutoSyncEnabled = useCallback((enabled: boolean) => {
    setFacebookSyncState((current) => ({
      ...current,
      autoSyncEnabled: enabled,
      lastSyncError: enabled ? "" : current.lastSyncError,
    }));
  }, []);

  React.useEffect(() => {
    if (!facebookSyncState.autoSyncEnabled) return;

    void triggerSync({ showNotification: false });
    const intervalId = window.setInterval(() => {
      void triggerSync({ showNotification: false });
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [facebookSyncState.autoSyncEnabled, triggerSync]);

  const handleUpdateCustomerTags = useCallback(
    (customerId: string, updatedTagIds: string[]) => {
      const isSyncEnabled = workspaceSettings?.tagSettings?.syncByCustomer;
      setCustomers((prev) => {
        const targetCustomer = prev.find(c => c.id === customerId);
        if (!targetCustomer) return prev;

        const targetPhone = targetCustomer.phone;

        return prev.map((c) => {
          if (c.id === customerId) return { ...c, tags: updatedTagIds };
          if (isSyncEnabled && targetPhone && c.phone === targetPhone) {
            return { ...c, tags: updatedTagIds };
          }
          return c;
        });
      });

      // Save to database
      fetch('/api/customers/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          tags: updatedTagIds,
          syncByCustomer: isSyncEnabled
        })
      }).catch(err => console.error("Failed to save customer tags:", err));
    },
    [workspaceSettings]
  );

  const handleUpdateCustomerDetails = useCallback(
    (customerId: string, fields: Partial<Customer>) => {
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, ...fields } : c))
      );

      fetch("/api/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, fields }),
      }).catch((err) => console.error("Failed to save customer details:", err));
    },
    []
  );

  const handleTogglePinMessage = useCallback(
    async (customerId: string, msgId: string) => {
      setCustomers((prev) =>
        prev.map((cust) => {
          if (cust.id !== customerId) return cust;
          return {
            ...cust,
            chatHistory: cust.chatHistory.map(msg => 
              msg.id === msgId ? { ...msg, isPinned: !msg.isPinned } : msg
            )
          };
        })
      );

      try {
        const res = await fetch(`/api/customers/${customerId}/messages/${msgId}/pin`, {
          method: "POST",
        });
        const json = await res.json();
        if (json.success && json.data) {
           setCustomers((prev) =>
             prev.map((cust) => (cust.id === customerId ? json.data : cust))
           );
        }
      } catch (err) {
        console.error("Failed to toggle pin message:", err);
      }
    },
    []
  );

  const handleSelectCustomer = useCallback((id: string) => {
    const lastReadAt = new Date().toISOString();
    setSelectedCustomerId(id);
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0, lastReadAt } : c))
    );

    fetch("/api/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: id,
        fields: { unreadCount: 0, lastReadAt },
      }),
    }).catch((err) => console.error("Failed to mark conversation as read:", err));
  }, []);

  const handleCreateOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === order.customerId) {
          const cleanedTags = c.tags.filter(
            (t) => t !== "tag-pending-pay" && t !== "tag-consulting"
          );
          const tagsWithSuccess = [
            ...new Set([...cleanedTags, "tag-completed"]),
          ];
          return {
            ...c,
            tags: tagsWithSuccess,
            phone: order.phone,
            address: order.fullAddress,
          };
        }
        return c;
      })
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        customers,
        selectedCustomerId,
        setSelectedCustomerId,
        activeShopName,
        setActiveShopName,
        orders,
        isSimulating,
        setIsSimulating,
        unreadCountSum,
        handleSendMessage,
        handleUpdateCustomerTags,
        handleUpdateCustomerDetails,
        handleSelectCustomer,
        handleCreateOrder,
        workspaceSettings,
        updateWorkspaceSettings,
        quickReplies,
        refreshQuickReplies,
        quickReplyTopics,
        refreshQuickReplyTopics,
        connectedPages,
        activePageId,
        setActivePageId,
        refreshConnectedPages,
        triggerSync,
        facebookSyncState,
        setAutoSyncEnabled,
        conversationFilters,
        setConversationFilters,
        resetConversationFilters,
        handleTogglePinMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
