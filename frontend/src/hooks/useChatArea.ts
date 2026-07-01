import { useState, useEffect, useRef } from "react";
import { Customer, QuickReply, Message } from "@/types";
import { useAppContext } from "@/contexts/AppContext";
import { message } from "antd";
import { QUICK_REPLIES } from "@/data/mockData";

export function useChatArea(
  customer: Customer | undefined,
  onSendMessage: (text: string, isQuickReply?: boolean, attachments?: any[], replyTo?: any) => void,
  onUpdateCustomerTags: (customerId: string, updatedTagIds: string[]) => void
) {
  const { workspaceSettings, quickReplies, quickReplyTopics, handleCreateOrder, handleTogglePinMessage } = useAppContext();

  // Local state for Quick Replies popup
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showQuickReplyPopover, setShowQuickReplyPopover] = useState(false);
  const [filteredQuickReplies, setFilteredQuickReplies] = useState<any[]>([]);
  const [selectedQRIndex, setSelectedQRIndex] = useState(0);
  const [inputText, setInputText] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [filteredShortcuts, setFilteredShortcuts] = useState<QuickReply[]>(QUICK_REPLIES);
  const [typingState, setTypingState] = useState<boolean>(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [isOrderCreatorOpen, setIsOrderCreatorOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const previousScrollStateRef = useRef({
    customerId: "",
    messageCount: 0,
    typingState: false,
  });

  useEffect(() => {
    const customerId = customer?.id || "";
    const messageCount = customer?.chatHistory.length || 0;
    const previous = previousScrollStateRef.current;
    const hasNewMessage = previous.customerId === customerId && messageCount > previous.messageCount;
    const hasStartedTyping = previous.customerId === customerId && typingState && !previous.typingState;

    previousScrollStateRef.current = {
      customerId,
      messageCount,
      typingState,
    };

    if (!customerId || (!hasNewMessage && !hasStartedTyping)) return;

    const frameId = window.requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [customer?.id, customer?.chatHistory.length, typingState]);

  // ---------------------------------------------------------------------------
  // QUICK REPLIES LOGIC
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const isSuggestEnabled = workspaceSettings?.quickReplySettings?.suggestQuickReply ?? true;
    if (inputText.startsWith("/") && isSuggestEnabled) {
      const search = inputText.substring(1).toLowerCase();
      const filtered = quickReplies.filter(
        (qr: any) => qr.shortcut.toLowerCase().includes(search) || qr.text.toLowerCase().includes(search)
      );
      setFilteredQuickReplies(filtered);
      setShowQuickReplies(true);
      setSelectedQRIndex(0);
    } else {
      setShowQuickReplies(false);
    }
  }, [inputText, quickReplies, workspaceSettings]);

  const insertQuickReply = (text: string) => {
    let replacedText = text;
    if (customer) {
      replacedText = replacedText.replace(/\[name\]/gi, customer.name);
    }

    const staffDetails = workspaceSettings?.quickReplySettings?.staffDetails || "Nhân viên hỗ trợ";
    replacedText = replacedText.replace(/#\{STAFF_DETAILS\}/g, staffDetails);

    if (workspaceSettings?.quickReplySettings?.sendImmediately) {
      onSendMessage(replacedText, true);
      setInputText("");
    } else {
      setInputText(replacedText);
    }
    setShowQuickReplies(false);
    setShowQuickReplyPopover(false);
    inputRef.current?.focus();
  };

  const handleSend = () => {
    if (!inputText.trim() && pendingAttachments.length === 0) return;
    if (inputText.trim() || pendingAttachments.length > 0) {
      onSendMessage(inputText.trim(), inputText.startsWith("/"), pendingAttachments, replyingTo);
    }
    setInputText("");
    setPendingAttachments([]);
    setReplyingTo(null);
    setShowShortcuts(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showQuickReplies && filteredQuickReplies.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedQRIndex((prev) => (prev + 1) % filteredQuickReplies.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedQRIndex((prev) => (prev - 1 + filteredQuickReplies.length) % filteredQuickReplies.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        insertQuickReply(filteredQuickReplies[selectedQRIndex].text);
        return;
      }
      if (e.key === "Escape") {
        setShowQuickReplies(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTagToggle = (tagId: string) => {
    if (!customer) return;
    const hasTag = customer.tags.includes(tagId);
    let updated;
    if (workspaceSettings?.tagSettings?.allowMultiple) {
      updated = hasTag ? customer.tags.filter((id) => id !== tagId) : [...customer.tags, tagId];
    } else {
      updated = hasTag ? [] : [tagId];
    }
    onUpdateCustomerTags(customer.id, updated);
  };

  const handleCallResult = (result: 'success' | 'fail') => {
    if (!customer) return;
    const callSettings = workspaceSettings?.tagSettings?.callCenter;
    const tagIdToApply = result === 'success' ? callSettings?.successTagId : callSettings?.failTagId;

    if (tagIdToApply) {
      const hasTag = customer.tags.includes(tagIdToApply);
      if (!hasTag) {
        let updated;
        if (workspaceSettings?.tagSettings?.allowMultiple) {
          updated = [...customer.tags, tagIdToApply];
        } else {
          updated = [tagIdToApply];
        }
        onUpdateCustomerTags(customer.id, updated);
      }
    }
    setCallModalOpen(false);
    message.success(result === 'success' ? 'Cuộc gọi thành công' : 'Đã ghi nhận cuộc gọi không thành công');
  };

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>, name: string) => {
    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b5998&color=fff`;
  };

  return {
    workspaceSettings,
    quickReplies,
    quickReplyTopics,
    handleCreateOrder,
    handleTogglePinMessage,
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
  };
}
