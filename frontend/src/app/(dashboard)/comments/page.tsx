"use client";

import { MessageCircle, Share2 } from "lucide-react";

export default function CommentsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-sky-50/50">
      <div className="max-w-3xl mx-auto text-center space-y-4 py-16">
        <div className="w-20 h-20 bg-white border border-sky-100 rounded-full flex items-center justify-center mx-auto shadow-md">
          <MessageCircle className="w-10 h-10 text-sky-300" />
        </div>
        <h1 className="text-xl font-black text-slate-700">Quản Lý Bình Luận Facebook</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Chức năng này sẽ được triển khai ở <strong>Giai đoạn 4</strong> theo lộ trình pancake.md — nhận comment qua webhook, trả lời và tạo đơn.
        </p>
        <a
          href="/facebook-connect"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white text-sm font-bold rounded-xl transition shadow-md"
        >
          <Share2 className="w-4 h-4" />
          Kết nối Facebook Page trước
        </a>
      </div>
    </div>
  );
}
