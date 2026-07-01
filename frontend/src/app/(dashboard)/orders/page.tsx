"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Layers,
  User,
  Phone,
  MapPin,
  Truck,
  FileText,
} from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";

export default function OrdersPage() {
  const { orders } = useAppContext();

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-sky-50/50 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-sky-100 pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-700 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-sky-500" />
              Lịch Sử Đơn Hàng ({orders.length})
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Danh sách đơn hàng đã chốt qua Hupunacake CRM trong phiên làm việc.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-sky-100 rounded-2xl p-12 text-center text-slate-400 max-w-md mx-auto space-y-4 shadow-sm">
            <Layers className="w-12 h-12 text-sky-200 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-slate-600">Chưa Có Đơn Hàng Nào</h3>
              <p className="text-xs mt-1 text-slate-400">
                Hãy quay lại{" "}
                <Link href="/inbox" className="text-sky-500 font-bold hover:underline">
                  Inbox
                </Link>
                , điền thông tin khách và bấm chốt đơn.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white border border-sky-100 rounded-2xl p-4 text-xs text-slate-600 space-y-3.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center border-b border-sky-50 pb-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">Mã Đơn Hàng</span>
                    <p className="text-sm font-black text-sky-600 font-mono">{ord.orderCode}</p>
                  </div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                    {ord.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-sky-400" /> {ord.customerName}</div>
                  <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-sky-400" /> {ord.phone}</div>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 mt-0.5 shrink-0" />
                    {ord.fullAddress}, {ord.ward}, {ord.district}, {ord.province}
                  </div>
                  <div className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-sky-400" /> {ord.carrier}</div>
                  <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-sky-400" /> {ord.note || "Không có ghi chú"}</div>
                </div>

                <div className="flex justify-between items-center bg-sky-50 p-2.5 rounded-xl border border-sky-100">
                  <span className="text-sky-500 font-bold text-[11px]">
                    {ord.paymentMethod === "COD" ? "💵 COD" : "🏦 Banking"}
                  </span>
                  <strong className="font-mono text-sky-600 text-sm">
                    {ord.total.toLocaleString("vi-VN")} đ
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
