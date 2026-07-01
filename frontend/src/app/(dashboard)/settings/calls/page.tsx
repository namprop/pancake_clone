"use client";

import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { SettingCard } from "@/components/ui/SettingCard";
import { SettingPageHeader } from "@/components/ui/SettingPageHeader";

const CALL_OPTIONS = [
  { value: "off", label: "Tắt" },
  { value: "hupunacake", label: "Hupunacake" },
  { value: "meta", label: "Meta Business Suite" },
];

export default function CallsSettingsPage() {
  const [selectedOption, setSelectedOption] = useState("off");
  const [isOpen, setIsOpen] = useState(false);

  const selected = CALL_OPTIONS.find((o) => o.value === selectedOption);

  return (
    <div className="max-w-[1100px] mx-auto py-8 px-8">
      <SettingPageHeader title="Cuộc gọi" />

      <SettingCard>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="font-bold text-[15px] text-gray-800">Cài đặt tính năng gọi</h3>
            <p className="text-[13px] text-gray-500">
              Khi tắt, bạn sẽ không thể nhận hoặc thực hiện cuộc gọi qua các nền tảng
            </p>
          </div>

          <div className="relative w-[220px]">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between h-9 px-3 bg-white border border-gray-300 rounded-md text-[13px] text-gray-700 hover:border-blue-500 transition"
            >
              <span>{selected?.label}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {isOpen && (
              <div
                className="absolute right-0 top-[110%] w-full bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
                onMouseLeave={() => setIsOpen(false)}
              >
                {CALL_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => { setSelectedOption(option.value); setIsOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2 text-[13px] text-left transition ${
                      selectedOption === option.value
                        ? "bg-[#e6f2ff] text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{option.label}</span>
                    {selectedOption === option.value && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </SettingCard>
    </div>
  );
}
