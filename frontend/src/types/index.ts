export enum Platform {
  FACEBOOK = "facebook",
  INSTAGRAM = "instagram",
  SHOPEE = "shopee",
  TIKTOK = "tiktok",
  WHATSAPP = "whatsapp",
  ZALO = "zalo",
}

export interface Tag {
  id: string;
  name: string;
  color: string; // e.g., "bg-red-500 text-white", "bg-yellow-400 text-slate-800"
}

export interface Message {
  id: string;
  sender: "customer" | "shop" | "system";
  messageType?: "text" | "image" | "sticker" | "audio" | "file" | "video";
  text: string;
  timestamp: Date;
  image?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  isQuickReplyUsed?: boolean;
  isPinned?: boolean;
  replyTo?: {
    messageId: string;
    senderName: string;
    text: string;
  };
}

export interface Customer {
  id: string;
  facebookCustomerId?: string;
  pageId?: string;
  pageName?: string;
  facebookConversationId?: string;
  name: string;
  avatar: string;
  platform: Platform;
  tags: string[]; // tag IDs
  phone: string;
  address: string;
  provinceCode: string;
  districtCode: string;
  wardCode: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  chatHistory: Message[];
  notes?: string;
  gender?: "male" | "female" | "unknown";
  birthday?: string | null;
  assigneeName?: string | null;
  assignedAt?: Date | string | null;
  isResolved?: boolean;
  resolvedAt?: Date | string | null;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  image: string;
  stock: number;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number; // custom or default of product
}

export interface Order {
  id: string;
  orderCode: string;
  customerId: string;
  customerName: string;
  phone: string;
  fullAddress: string;
  province: string;
  district: string;
  ward: string;
  items: OrderItem[];
  shippingFee: number;
  discount: number;
  total: number;
  carrier: string; // "GHTK" | "GHN" | "ViettelPost" | "J&T"
  paymentMethod: "COD" | "BANKING";
  note: string;
  deliveryNote: string;
  status: "pending" | "processing" | "shipped" | "cancelled";
  orderTime: Date;
}

export interface Province {
  code: string;
  name: string;
}

export interface District {
  code: string;
  provinceCode: string;
  name: string;
}

export interface Ward {
  code: string;
  districtCode: string;
  name: string;
}

export interface QuickReplyTopic {
  id: string;
  name: string;
  color?: string; // e.g. "bg-red-100"
}

export interface QuickReply {
  id: string;
  shortcut: string; // e.g. "/sdt", "/price"
  text: string;
  description: string;
  topicId?: string;
}
