"use client";

interface Option<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number> {
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  "aria-label": string;
  /** 1 行に並べる列数（省略時は自動） */
  columns?: number;
  size?: "sm" | "md";
}

/** 選択肢が少ないときに使う、タップしやすいボタン群 */
export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  columns,
  size = "md",
  ...rest
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={rest["aria-label"]}
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={`rounded-xl border-2 font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 ${
              size === "sm" ? "px-2 py-2 text-sm" : "px-3 py-3 text-base"
            } ${
              selected
                ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500"
                : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
