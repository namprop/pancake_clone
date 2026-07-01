"use client";

import React from "react";
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

export default function DashboardPage() {
  const { orders, customers, activeShopName } = useAppContext();
  const totalCOD = orders.reduce((acc, o) => acc + o.total, 0);
  const successRate = orders.length > 0 ? 100 : 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-sky-50/50 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="border-b border-sky-100 pb-4">
          <h1 className="text-xl font-black text-slate-700 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-500" />
            Báo Cáo Kết Quả Chốt Đơn ({activeShopName})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Số liệu doanh thu thực tế và hiệu suất tư vấn bán hàng trong phiên làm việc hiện tại.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<DollarSign className="w-6 h-6" />} label="Doanh Thu Chốt Được" value={`${totalCOD.toLocaleString("vi-VN")} đ`} color="emerald" />
          <StatCard icon={<ShoppingBag className="w-6 h-6" />} label="Tổng Đơn Hàng" value={`${orders.length} đơn`} color="sky" />
          <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Tỷ Lệ Chốt Thành Công" value={`${successRate}% phản hồi`} color="blue" />
          <StatCard icon={<Users className="w-6 h-6" />} label="Khách Inbox" value={`${customers.length} lead`} color="purple" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-sky-100 p-5 rounded-2xl text-xs space-y-4 shadow-sm">
            <h3 className="font-extrabold text-slate-700">Hiệu năng theo nguồn tin nhắn</h3>
            <ChannelBar label="Facebook Messenger" percent={45} color="bg-blue-500" />
            <ChannelBar label="Shopee Live & Chat" percent={30} color="bg-orange-500" />
            <ChannelBar label="Instagram Direct" percent={15} color="bg-pink-500" />
            <ChannelBar label="WhatsApp & TikTok" percent={10} color="bg-teal-400" />
          </div>

          <div className="bg-white border border-sky-100 p-5 rounded-2xl text-xs text-slate-400 flex flex-col justify-center items-center text-center gap-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-500">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-600">Gợi ý chốt đơn</h4>
              <p className="text-[10.5px] max-w-xs mt-1 text-slate-400 leading-normal">
                Hơn <strong>70% khách hàng</strong> hoàn tất đơn nhanh hơn khi shop gửi thông tin VietQR thay vì bắt nhập tay số TK. Dùng phím tắt <strong>/ck</strong> và <strong>/ship</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: "emerald" | "sky" | "blue" | "purple" }) {
  const colors = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-500",
    sky: "bg-sky-50 border-sky-200 text-sky-500",
    blue: "bg-blue-50 border-blue-200 text-blue-500",
    purple: "bg-purple-50 border-purple-200 text-purple-500",
  };
  const valueColors = {
    emerald: "text-emerald-600",
    sky: "text-sky-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
  };

  return (
    <div className="bg-white border border-sky-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-full border flex items-center justify-center shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</span>
        <h3 className={`text-lg font-black font-mono mt-0.5 ${valueColors[color]}`}>{value}</h3>
      </div>
    </div>
  );
}

function ChannelBar({ label, percent, color }: { label: string; percent: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
        <span>{label}</span>
        <span className="font-bold">{percent}% đơn</span>
      </div>
      <div className="w-full bg-sky-50 h-2 rounded-full overflow-hidden border border-sky-100">
        <div className={`${color} h-full rounded-full`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
