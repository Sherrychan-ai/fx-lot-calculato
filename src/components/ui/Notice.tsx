import type { ReactNode } from "react";

type Tone = "info" | "success" | "caution" | "danger";

interface NoticeProps {
  tone?: Tone;
  children: ReactNode;
  className?: string;
  role?: "alert" | "status";
}

const TONES: Record<Tone, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-100",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100",
  caution:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100",
  danger:
    "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-100",
};

export function Notice({ tone = "info", children, className = "", role }: NoticeProps) {
  return (
    <div
      role={role}
      className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${TONES[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
