import { useState, useEffect } from "react";

export function useFacebookConnect() {
  const [success, setSuccess] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);

  useEffect(() => {
    // Check url search params on client side safely
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setSuccess(true);
      // Clean query params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoadingPages(true);
      const res = await fetch("/api/facebook/pages");
      const data = await res.json();
      if (data.success && data.data) {
        setPages(data.data);
      }
    } catch (e) {
      console.error("Failed to load connected pages:", e);
    } finally {
      setLoadingPages(false);
    }
  };

  const handleFacebookLogin = () => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || "1708753803778608";
    const redirectUri = "http://localhost:3012/api/facebook/callback"; 
    const scopes = "pages_show_list,pages_messaging,pages_read_engagement,pages_manage_engagement";
    const facebookAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}`;
    window.location.href = facebookAuthUrl;
  };

  const handleToggleActive = async (pageId: string, isActive: boolean) => {
    try {
      const res = await fetch("/api/facebook/pages/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId, isActive }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh page list
        fetchPages();
      }
    } catch (e) {
      console.error("Failed to update page active status:", e);
    }
  };

  const handleUpdateActivePages = async (selectedPageIds: string[]) => {
    try {
      const selectedSet = new Set(selectedPageIds);
      const responses = await Promise.all(
        pages.map((page) =>
          fetch("/api/facebook/pages/connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pageId: page.pageId,
              isActive: selectedSet.has(page.pageId),
            }),
          })
        )
      );

      const hasFailedRequest = responses.some((res) => !res.ok);
      if (hasFailedRequest) return false;

      await fetchPages();
      window.dispatchEvent(new Event("facebook-pages-updated"));
      return true;
    } catch (e) {
      console.error("Failed to update selected Facebook pages:", e);
      return false;
    }
  };

  return {
    success,
    pages,
    loadingPages,
    handleFacebookLogin,
    handleToggleActive,
    handleUpdateActivePages
  };
}
