import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";

const DUMMY_WORKSPACE_ID = "65a123456789012345678901";

export function useInbox() {
  const {
    customers,
    selectedCustomerId,
    handleSelectCustomer,
    handleSendMessage,
    handleUpdateCustomerTags,
    handleUpdateCustomerDetails,
    isSimulating,
    setIsSimulating,
    handleCreateOrder,
    orders,
  } = useAppContext();

  const [orderPanelOpen, setOrderPanelOpen] = useState(true);
  const [apiTags, setApiTags] = useState<any[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch(`/api/settings/tags?workspaceId=${DUMMY_WORKSPACE_ID}`);
        const json = await res.json();
        if (json.success) setApiTags(json.data);
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };
    fetchTags();
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return {
    // Global context values and handlers
    customers,
    selectedCustomerId,
    handleSelectCustomer,
    handleSendMessage,
    handleUpdateCustomerTags,
    handleUpdateCustomerDetails,
    isSimulating,
    setIsSimulating,
    handleCreateOrder,
    orders,
    
    // Local state & derived state
    orderPanelOpen,
    setOrderPanelOpen,
    apiTags,
    selectedCustomer,
  };
}
