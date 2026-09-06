"use client";

import type { InputHTMLAttributes } from "react";

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  /** 末尾に表示する単位（円 / pips など） */
  suffix?: string;
  /** エラー表示にするか */
  invalid?: boolean;
}

export function TextField({
  value,
  onChange,
  suffix,
  invalid = false,
  className = "",
  ...rest
}: TextFieldProps) {
  return (
    <div className="relative">
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        className={`w-full rounded-xl border-2 bg-white px-4 py-3 text-lg font-semibold tabular-nums outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:bg-slate-800 dark:placeholder:text-slate-500 ${
          invalid
            ? "border-rose-400 dark:border-rose-500"
            : "border-slate-200 dark:border-slate-700"
        } ${suffix ? "pr-14" : ""} ${className}`}
      />
      {suffix && (
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  );
}
