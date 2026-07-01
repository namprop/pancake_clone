"use client";

import { useEffect, useState } from "react";
import ChatList from "./components/ChatList";
import ChatArea from "./components/ChatArea";
import OrderCreator from "./components/OrderCreator";
import ConversationInfoPanel from "./components/ConversationInfoPanel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useInbox } from "@/hooks/useInbox";

export default function InboxPage() {
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
    orderPanelOpen,
    setOrderPanelOpen,
    apiTags,
    selectedCustomer,
  } = useInbox();
  const [conversationInfoOpen, setConversationInfoOpen] = useState(false);
  const [userConversationSearch, setUserConversationSearch] = useState("");

  const handleToggleConversationInfo = () => {
    setConversationInfoOpen((open) => {
      const nextOpen = !open;
      return nextOpen;
    });
    setOrderPanelOpen(true);
  };

  const handleToggleUserConversations = () => {
    if (!selectedCustomer) return;
    const customerId = selectedCustomer.facebookCustomerId || selectedCustomer.id;
    const nextSearch = `cus_id:${customerId}`;
    setUserConversationSearch((current) => (current === nextSearch ? "" : nextSearch));
  };

  useEffect(() => {
    if (typeof window === "undefined" || customers.length === 0) return;

    const conversationId = new URLSearchParams(window.location.search).get("c_id")?.trim();
    if (!conversationId) return;

    const normalizedConversationId = conversationId.toLowerCase();
    const matchedCustomer = customers.find((customer) => {
      const pageCustomerConversationId =
        customer.pageId && customer.facebookCustomerId
          ? `${customer.pageId}_${customer.facebookCustomerId}`
          : "";

      return [
        customer.facebookConversationId,
        pageCustomerConversationId,
        customer.facebookCustomerId,
        customer.id,
      ].some((value) => value?.toLowerCase() === normalizedConversationId);
    });

    if (matchedCustomer && matchedCustomer.id !== selectedCustomerId) {
      handleSelectCustomer(matchedCustomer.id);
    }
  }, [customers, handleSelectCustomer, selectedCustomerId]);

  return (
    <>
      <ChatList
        customers={customers}
        selectedCustomerId={selectedCustomerId}
        onSelectCustomer={handleSelectCustomer}
        tags={apiTags}
        forcedSearchQuery={userConversationSearch}
      />
      <ChatArea
        customer={selectedCustomer}
        tags={apiTags}
        onSendMessage={handleSendMessage}
        onUpdateCustomerTags={handleUpdateCustomerTags}
        onUpdateCustomerDetails={handleUpdateCustomerDetails}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        isUserConversationsOpen={Boolean(userConversationSearch)}
        onToggleUserConversations={handleToggleUserConversations}
        isConversationInfoOpen={conversationInfoOpen}
        onToggleConversationInfo={handleToggleConversationInfo}
      />

      {/* OrderCreator panel with collapse/expand */}
      <div className="relative flex shrink-0 h-full">
        {/* Toggle button */}
        {!conversationInfoOpen && (
        <Button
          variant="outline"
          onClick={() => setOrderPanelOpen(!orderPanelOpen)}
          className={`absolute top-1/2 -translate-y-1/2 z-50 w-6 h-16 shadow-lg flex items-center justify-center text-sky-500 hover:bg-sky-50 hover:text-sky-600 rounded-r-none rounded-l-xl p-0 border-r-0 ${
            orderPanelOpen ? "-left-6" : "-left-6"
          }`}
          title={orderPanelOpen ? "Ẩn panel tạo đơn" : "Mở panel tạo đơn"}
        >
          {orderPanelOpen ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </Button>
        )}

        {/* Panel */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            orderPanelOpen ? "w-[360px] lg:w-[410px]" : "w-0"
          }`}
        >
          <div className="w-[360px] lg:w-[410px] h-full">
            {conversationInfoOpen ? (
              <ConversationInfoPanel
                customer={selectedCustomer}
                onClose={() => setConversationInfoOpen(false)}
              />
            ) : (
              <OrderCreator
                customer={selectedCustomer}
                onCreateOrder={handleCreateOrder}
                onUpdateCustomerDetails={handleUpdateCustomerDetails}
                orders={orders}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
