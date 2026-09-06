"use client";

import { useTheme } from "@/hooks/useTheme";

export function AppHeader() {
  const { isDark, toggle } = useTheme();
  return (
    <header className="mb-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            FX ロット・損切り計算機
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            1回の損失を資金の◯％以内に抑えるための、適正ロット数を計算します。
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label={isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
          title={isDark ? "ライトモード" : "ダークモード"}
          className="shrink-0 rounded-full border border-slate-200 bg-white p-2 text-lg shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
        >
          <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span>
        </button>
      </div>
    </header>
  );
}
