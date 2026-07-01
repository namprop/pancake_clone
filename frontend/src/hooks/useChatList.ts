import { useState } from "react";
import { Customer, Platform, Tag } from "@/types";
import { useAppContext } from "@/contexts/AppContext";

export function useChatList(customers: Customer[], tags: Tag[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNREAD" | "PHONE" | "NO_PHONE" | "NO_TAG">("ALL");
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
  const { workspaceSettings, triggerSync } = useAppContext();

  const filteredCustomers = customers.filter((cust) => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const customerIdSearch = normalizedSearch.startsWith("cus_id:")
      ? normalizedSearch.slice("cus_id:".length).trim()
      : "";
    const matchesSearch = customerIdSearch
      ? [cust.facebookCustomerId, cust.id, cust.facebookConversationId]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(customerIdSearch))
      : cust.name.toLowerCase().includes(normalizedSearch) ||
        cust.phone.includes(searchQuery.trim()) ||
        cust.lastMessage.toLowerCase().includes(normalizedSearch) ||
        (cust.pageName || "").toLowerCase().includes(normalizedSearch);
    const matchesPlatform = platformFilter === "ALL" || cust.platform === platformFilter;
    let matchesStatus = true;
    if (statusFilter === "UNREAD") matchesStatus = cust.unreadCount > 0;
    else if (statusFilter === "PHONE") matchesStatus = cust.phone.trim().length >= 9;
    else if (statusFilter === "NO_PHONE") matchesStatus = cust.phone.trim().length === 0;
    else if (statusFilter === "NO_TAG") matchesStatus = cust.tags.length === 0;
    // Apply tag filter based on filterMode
    let matchesTag = true;
    if (activeTagFilters.length > 0) {
      if (workspaceSettings?.tagSettings?.filterMode === "OR") {
        matchesTag = activeTagFilters.some((tagId) => cust.tags.includes(tagId));
      } else {
        // AND mode (default)
        matchesTag = activeTagFilters.every((tagId) => cust.tags.includes(tagId));
      }
    }
    return matchesSearch && matchesPlatform && matchesStatus && matchesTag;
  });

  return {
    searchQuery,
    setSearchQuery,
    platformFilter,
    setPlatformFilter,
    statusFilter,
    setStatusFilter,
    activeTagFilters,
    setActiveTagFilters,
    filteredCustomers,
    triggerSync,
    workspaceSettings,
  };
}
