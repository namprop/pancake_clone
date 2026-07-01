import React from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  /**
   * Native onChange event — same as native <select>.
   * Used by OrderCreator and any code that needs e.target.value.
   */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /**
   * Shortcut: receive the selected value string directly (no event object).
   * Used by settings pages.
   */
  onValueChange?: (value: string) => void;
  /** Ant-design-style options array — alternative to children <option> */
  options?: SelectOption[];
  /** Placeholder shown as first disabled option */
  placeholder?: string;
}

/**
 * Select component styled like antd, wrapping a native <select>.
 *
 * - `onChange`      → receives full ChangeEvent (backward compat with OrderCreator etc.)
 * - `onValueChange` → receives the string value directly (handy for settings pages)
 * - `options`       → array of { value, label } objects (alternative to children)
 * - `placeholder`   → rendered as first disabled option
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onChange, onValueChange, options, placeholder, style, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    return (
      <select
        ref={ref}
        onChange={handleChange}
        style={style}
        className={[
          "w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[13px] text-gray-800 shadow-sm",
          "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
          "appearance-none cursor-pointer",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
    );
  }
);

Select.displayName = "Select";

export { Select };
