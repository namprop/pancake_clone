"use client";

import { Package } from "lucide-react";
import { PRODUCTS } from "@/data/mockData";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/Button";

export default function ProductsPage() {
  const { activeShopName } = useAppContext();

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-sky-50/50 select-none">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-sky-100 pb-4">
          <div>
            <h1 className="text-xl font-black text-slate-700 flex items-center gap-2">
              <Package className="w-6 h-6 text-sky-500" />
              Kho Hàng & Sản Phẩm ({PRODUCTS.length})
            </h1>
            <p className="text-xs text-slate-400 mt-1">Quản lý sản phẩm của shop: {activeShopName}</p>
          </div>
          <Button
            type="button"
            className="px-4 py-2 text-xs font-bold rounded-lg shadow-md"
          >
            + Thêm Sản Phẩm
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="bg-white border border-sky-100 rounded-xl p-4 flex gap-4 hover:border-sky-300 hover:shadow-md transition-all shadow-sm"
            >
              <img
                src={prod.image}
                alt={prod.name}
                className="w-20 h-20 rounded-lg object-cover border border-sky-100"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] bg-sky-50 text-sky-500 border border-sky-200 px-1.5 py-0.5 rounded uppercase font-bold">
                    SKU: {prod.sku}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-700 truncate mt-1.5">{prod.name}</h3>
                </div>
                <div className="flex justify-between items-end mt-2">
                  <p className="text-sm font-black text-sky-600 font-mono">{prod.price.toLocaleString("vi-VN")} đ</p>
                  <p className="text-xs font-bold font-mono text-emerald-500">{prod.stock} cái</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
