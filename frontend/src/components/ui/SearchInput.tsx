import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  width?: number | string;
}

/**
 * Search input with prefix icon — styled natively to match antd aesthetics.
 */
export function SearchInput({
  placeholder = "Tìm kiếm",
  value,
  onChange,
  className = "",
  width = 300,
  ...props
}: SearchInputProps) {
  return (
    <div className="relative" style={{ width }}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={[
          "w-full h-9 bg-[#f5f6f8] border border-gray-200 rounded-md pl-9 pr-4 text-[13px]",
          "text-gray-700 placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    </div>
  );
}
