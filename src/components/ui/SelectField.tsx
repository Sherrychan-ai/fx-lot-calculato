"use client";

import type { SelectHTMLAttributes } from "react";

interface Option<T extends string | number> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string | number>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  invalid?: boolean;
}

export function SelectField<T extends string | number>({
  value,
  options,
  onChange,
  invalid = false,
  className = "",
  ...rest
}: SelectFieldProps<T>) {
  return (
    <div className="relative">
      <select
        {...rest}
        value={String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          const match = options.find((o) => String(o.value) === raw);
          if (match) onChange(match.value);
        }}
        aria-invalid={invalid || undefined}
        className={`w-full appearance-none rounded-xl border-2 bg-white px-4 py-3 pr-10 text-lg font-semibold outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 dark:bg-slate-800 ${
          invalid
            ? "border-rose-400 dark:border-rose-500"
            : "border-slate-200 dark:border-slate-700"
        } ${className}`}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-4 my-auto h-5 w-5 text-slate-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
