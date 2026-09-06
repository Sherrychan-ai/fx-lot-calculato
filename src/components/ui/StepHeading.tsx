interface StepHeadingProps {
  step: number;
  title: string;
  hint?: string;
  htmlFor?: string;
}

/** 「1 資金」のような番号付き見出し。入力順が一目で分かるようにする */
export function StepHeading({ step, title, hint, htmlFor }: StepHeadingProps) {
  const Tag = htmlFor ? "label" : "div";
  return (
    <Tag htmlFor={htmlFor} className="mb-2 flex items-center gap-2">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white dark:bg-indigo-500"
      >
        {step}
      </span>
      <span className="text-base font-bold">{title}</span>
      {hint && (
        <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>
      )}
    </Tag>
  );
}
