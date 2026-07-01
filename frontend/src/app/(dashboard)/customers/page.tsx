"use client";

import { Users } from "lucide-react";
import { TAGS } from "@/data/mockData";
import { useAppContext } from "@/contexts/AppContext";

export default function CustomersPage() {
  const { customers } = useAppContext();

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-sky-50/50">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="border-b border-sky-100 pb-4">
          <h1 className="text-xl font-black text-slate-700 flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-500" />
            Khách Hàng ({customers.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Danh sách khách từ inbox — sẽ đồng bộ MongoDB ở Giai đoạn 5.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.map((cust) => (
            <div
              key={cust.id}
              className="bg-white border border-sky-100 rounded-xl p-4 flex gap-3 shadow-sm hover:shadow-md hover:border-sky-200 transition-all"
            >
              <img
                src={cust.avatar}
                alt={cust.name}
                className="w-12 h-12 rounded-full object-cover border border-sky-100"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-700 text-sm truncate">{cust.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {cust.phone || "Chưa có SĐT"}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {cust.tags.map((tagId) => {
                    const tag = TAGS.find((t) => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <span key={tagId} className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${tag.color}`}>
                        {tag.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
