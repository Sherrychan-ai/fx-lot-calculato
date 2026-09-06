"use client";

import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  const styles = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:disabled:bg-slate-700",
    secondary:
      "border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600",
    ghost:
      "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  }[variant];
  return (
    <button
      type={type}
      {...rest}
      className={`rounded-xl px-4 py-3 text-base font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed ${styles} ${className}`}
    />
  );
}
