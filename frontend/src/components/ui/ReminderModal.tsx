import React, { useState } from "react";
import { X, Calendar, Phone, ChevronDown, Plus, User } from "lucide-react";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
  customerName?: string;
}

export function ReminderModal({ isOpen, onClose, initialText = "", customerName = "Khách hàng" }: ReminderModalProps) {
  const [activeTab, setActiveTab] = useState("Hôm nay");
  const [phone, setPhone] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [content, setContent] = useState(initialText);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-[#f4f6f8] w-[850px] max-w-[95vw] rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4">
          <h2 className="text-[16px] font-bold text-slate-800">Tạo nhắc hẹn</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex px-5 pb-5 gap-4 h-[580px]">
          {/* Left Panel */}
          <div className="w-[340px] flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex bg-white rounded-lg p-1 border border-gray-200 text-[13px] font-medium">
                <button
                  className={`px-4 py-1.5 rounded-md transition-colors ${activeTab === "Hôm nay" ? "bg-white text-slate-800 border border-gray-100 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => setActiveTab("Hôm nay")}
                >
                  Hôm nay
                </button>
                <button
                  className={`px-4 py-1.5 rounded-md transition-colors ${activeTab === "Sắp tới" ? "bg-white text-slate-800 border border-gray-100 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => setActiveTab("Sắp tới")}
                >
                  Sắp tới
                </button>
              </div>
              <button className="bg-blue-100 text-blue-500 p-2 rounded-lg hover:bg-blue-200 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-[15px] h-[15px] text-slate-800" strokeWidth={2.5} />
                <span className="font-bold text-slate-800 text-[13px]">Khách hàng {customerName}</span>
              </div>
              <div className="border border-dashed border-gray-200 rounded-lg py-8 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <Calendar className="w-[18px] h-[18px]" strokeWidth={2} />
                </div>
                <span className="text-[12px] text-gray-400 mt-1">Chưa có nhắc hẹn</span>
              </div>
            </div>

            {/* All Reminders Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-[15px] h-[15px] text-slate-800" strokeWidth={2.5} />
                <span className="font-bold text-slate-800 text-[13px]">Tất cả nhắc hẹn</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center flex-1 -mt-4">
                <div className="w-[140px] h-[100px] mb-2 opacity-80 mix-blend-multiply">
                  {/* Cloud placeholder matching the image roughly */}
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25 55C25 46.7157 31.7157 40 40 40C41.242 40 42.4496 40.1506 43.6061 40.4307C46.3312 34.2982 52.6105 30 60 30C71.0457 30 80 38.9543 80 50C80 50.1581 79.9982 50.3157 79.9946 50.4727C85.642 51.6888 90 56.7621 90 62.9167C90 70.1418 84.1418 76 76.9167 76H35C24.5066 76 16 67.4934 16 57C16 56.3263 16.035 55.6608 16.1032 55.0044C18.6657 55.671 21.3995 56.027 24.2374 56.027C24.4925 56.027 24.7468 56.0177 25 55Z" fill="#e2e8f0"/>
                    <circle cx="50" cy="52" r="2" fill="#64748b"/>
                    <circle cx="62" cy="52" r="2" fill="#64748b"/>
                    <path d="M54 56 Q 56 58 58 56" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="text-[14px] font-bold text-[#334155] mb-1">Bạn chưa có lịch hẹn nào</div>
                <div className="text-[13px] text-[#64748b] max-w-[260px] leading-relaxed">
                  Tạo nhắc hẹn giúp bạn nhớ việc, khỏi lo trễ hẹn với khách
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 flex flex-col relative">
            <h3 className="font-bold text-slate-800 text-[15px] mb-5">Nhắc hẹn mới</h3>
            
            <div className="flex flex-col gap-5 flex-1">
              {/* Phone */}
              <div>
                <label className="block text-[13px] text-slate-600 mb-1.5">Số điện thoại <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Phone className="w-[15px] h-[15px]" strokeWidth={2} />
                  </div>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại" 
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-400 text-slate-700"
                  />
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-[13px] text-slate-600 mb-1.5">Thời gian nhắc <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Calendar className="w-[15px] h-[15px]" strokeWidth={2} />
                  </div>
                  <input 
                    type="text" 
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    placeholder="DD/MM/YYYY • HH:mm"
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-700"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[13px] text-slate-600 mb-1.5">Trạng thái</label>
                <div className="inline-flex items-center gap-1 bg-[#f97316] text-white px-3 py-1.5 rounded-full text-[13px] font-medium cursor-pointer hover:bg-orange-600 transition-colors shadow-sm">
                  Chưa xử lý
                  <ChevronDown className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <label className="block text-[13px] text-slate-600 mb-1.5">Nội dung thông báo <span className="text-red-500">*</span></label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full flex-1 border border-gray-200 rounded-lg p-3 text-[14px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none text-slate-700"
                  placeholder="Nhập nội dung nhắc hẹn..."
                />
              </div>

              {/* Staff Receiver */}
              <div className="mb-8">
                <label className="block text-[13px] text-slate-600 mb-1.5">Nhân viên nhận thông báo</label>
                <div className="w-full border border-gray-200 rounded-lg p-[5px] flex items-center justify-between cursor-pointer hover:border-gray-300 transition-colors bg-white">
                  <div className="flex items-center gap-1.5 bg-gray-100/80 px-2 py-1.5 rounded-md border border-gray-200">
                    <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-white">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[13px] text-slate-700">Phạm Tiến Nam</span>
                    <button className="text-gray-400 hover:text-gray-600 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 mr-2" />
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 right-6">
              <button 
                onClick={onClose}
                className="bg-[#1d4ed8] text-white px-6 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-blue-800 transition-colors shadow-sm"
              >
                Tạo nhắc hẹn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
