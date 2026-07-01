"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  CirclePlus,
  Layers3,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { notification } from "antd";
import { Button } from "@/components/ui/Button";
import { useFacebookConnect } from "@/hooks/useFacebookConnect";

type PageItem = {
  pageId: string;
  pageName: string;
  pageAvatar?: string;
  isActive?: boolean;
};


export default function FacebookConnectPage() {
  const {
    success,
    pages,
    loadingPages,
    handleFacebookLogin,
    handleUpdateActivePages,
  } = useFacebookConnect();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [savingPages, setSavingPages] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const displayPages = pages as PageItem[];

  useEffect(() => {
    setSelectedPageIds(pages.filter((page) => page.isActive).map((page) => page.pageId));
  }, [pages]);

  const filteredPages = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return displayPages;

    return displayPages.filter((page) =>
      `${page.pageName} ${page.pageId}`.toLowerCase().includes(keyword)
    );
  }, [displayPages, searchTerm]);

  const totalCount = displayPages.length;
  const facebookCount = displayPages.length;
  const selectedCount = selectedPageIds.length;

  const toggleSelectedPage = (pageId: string) => {
    setSaveSuccess(false);

    setSelectedPageIds((current) =>
      current.includes(pageId)
        ? current.filter((id) => id !== pageId)
        : [...current, pageId]
    );
  };

  const applySelectedPages = async () => {
    if (pages.length === 0 || savingPages) return;

    setSavingPages(true);
    try {
      const updated = await handleUpdateActivePages(selectedPageIds);
      setSaveSuccess(updated);
      if (updated) {
        notification.success({
          message: "Kết nối thành công",
          description: `Pancake sẽ nhận và hiển thị tin nhắn từ ${selectedPageIds.length} Fanpage đã chọn.`,
          placement: "top",
          duration: 3,
        });
      } else {
        notification.error({
          message: "Kết nối thất bại",
          description: "Không thể lưu danh sách Fanpage đã chọn. Vui lòng thử lại.",
          placement: "top",
          duration: 3,
        });
      }
    } finally {
      setSavingPages(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#ececf4] p-4 select-none">
      <div className="space-y-2">
        <section className="rounded-md bg-white px-5 py-4 shadow-sm">
          <div className="mb-3 text-[15px] font-bold text-black">Bảng điều khiển</div>
          <div className="flex items-center justify-between gap-4">
            <label className="relative block w-full max-w-[318px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm kiếm"
                className="h-[30px] w-full rounded-md bg-[#e9ebf0] pl-9 pr-3 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label="Làm mới"
                className="flex h-[30px] w-[30px] items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-[17px] w-[17px]" />
              </button>
              <Button
                type="button"
                onClick={handleFacebookLogin}
                className="h-[30px] gap-2 rounded-md bg-[#1877f2] px-3 text-xs font-bold text-white shadow-none hover:bg-[#166fe5] hover:scale-100 active:scale-100"
              >
                <CirclePlus className="h-4 w-4" />
                Kết nối Facebook
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-md bg-white px-5 py-2 shadow-sm">
          <div className="flex h-9 items-center">
            <button
              type="button"
              className="flex h-full min-w-[152px] items-center gap-2 rounded-md bg-[#d7edfc] px-3 text-xs font-bold text-black"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-500 text-white">
                <Layers3 className="h-3.5 w-3.5" />
              </span>
              Tất cả
              <CountBadge value={totalCount} active />
            </button>
            <div className="mx-5 h-6 w-px bg-slate-200" />
            <button
              type="button"
              className="flex h-full min-w-[152px] items-center gap-2 rounded-md px-3 text-xs font-bold text-black transition hover:bg-slate-50"
            >
              <FacebookMark className="h-5 w-5 text-[17px]" />
              Facebook
              <CountBadge value={facebookCount} />
            </button>
          </div>
        </section>

        <main className="min-h-[586px] rounded-md bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Chọn Fanpage để Pancake nhận và hiển thị tin nhắn</span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                Đã chọn {selectedCount}
              </span>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Kết nối thành công
                </span>
              )}
            </div>
            <Button
              type="button"
              onClick={applySelectedPages}
              disabled={pages.length === 0 || savingPages}
              className="h-[30px] gap-2 rounded-md bg-[#e5e7eb] px-3 text-xs font-bold text-slate-800 shadow-none hover:bg-[#dfe3ea] hover:scale-100 active:scale-100"
            >
              {savingPages ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Kết nối
            </Button>
          </div>

          {success && (
            <div className="mb-4 flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Kết nối Facebook thành công
            </div>
          )}

          {loadingPages ? (
            <div className="flex h-32 items-center gap-2 text-xs font-semibold text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải danh sách Fanpage...
            </div>
          ) : filteredPages.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filteredPages.map((page) => (
                <PageCard
                  key={page.pageId}
                  page={page}
                  checked={selectedPageIds.includes(page.pageId)}
                  onCheckedChange={() => toggleSelectedPage(page.pageId)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-32 max-w-[640px] flex-col justify-center gap-2 text-xs font-semibold text-slate-500">
              <span>Chua t?i du?c Fanpage th?t t? Facebook.</span>
              <span className="font-medium">Ki?m tra backend <code className="rounded bg-slate-100 px-1">FACEBOOK_APP_SECRET</code>, restart backend r?i b?m K?t n?i Facebook l?i.</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function CountBadge({ value, active = false }: { value: number; active?: boolean }) {
  return (
    <span
      className={`ml-auto flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
        active ? "bg-[#1e8ef7] text-white" : "bg-slate-200 text-slate-500"
      }`}
    >
      {value}
    </span>
  );
}

function PageCard({
  page,
  checked,
  onCheckedChange,
}: {
  page: PageItem;
  checked: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <article
      className={`relative flex h-20 w-[410px] max-w-full items-center rounded-md border bg-white px-3 shadow-[0_1px_0_rgba(15,23,42,0.02)] transition ${
        checked ? "border-[#7ab8f5] ring-1 ring-[#d7edfc]" : "border-[#ccd5e5]"
      }`}
    >
      <label className="absolute right-2 top-2 flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={onCheckedChange}
        />
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-slate-300 bg-white text-white transition peer-checked:border-[#1e8ef7] peer-checked:bg-[#1e8ef7]">
          <Check className="h-3 w-3" />
        </span>
      </label>

      <div className="h-[60px] w-[74px] overflow-hidden rounded-sm border border-slate-200 bg-slate-50">
        <img
          src={page.pageAvatar || "/next.svg"}
          alt={page.pageName}
          className="h-full w-full object-cover"
          onError={(event) => {
            (event.target as HTMLImageElement).src = "/next.svg";
          }}
        />
      </div>

      <div className="min-w-0 flex-1 px-3">
        <h2 className="truncate text-xs font-bold text-slate-800">{page.pageName}</h2>
        <div className="mt-4 flex min-w-0 items-center gap-2 text-[11px] font-medium text-[#75839b]">
          <FacebookMark className="h-3.5 w-3.5 shrink-0 text-[12px]" />
          <span className="truncate">{page.pageId}</span>
        </div>
      </div>
    </article>
  );
}

function FacebookMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[3px] bg-[#1877f2] font-black leading-none text-white ${className}`}
    >
      f
    </span>
  );
}
