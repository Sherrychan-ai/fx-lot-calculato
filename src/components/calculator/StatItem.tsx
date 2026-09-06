interface StatItemProps {
  label: string;
  value: string;
  sub?: string;
  emphasis?: boolean;
}

export function StatItem({ label, value, sub, emphasis = false }: StatItemProps) {
  return (
    <div className="rounded-xl bg-slate-100 px-3 py-3 dark:bg-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`mt-0.5 font-bold tabular-nums text-slate-900 dark:text-white ${
          emphasis ? "text-xl" : "text-lg"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  );
}
