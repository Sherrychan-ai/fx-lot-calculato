"use client";

import { Card } from "@/components/ui/Card";
import { StepHeading } from "@/components/ui/StepHeading";
import { TextField } from "@/components/ui/TextField";
import { findPair } from "@/lib/fx/currencyPairs";
import { formatPips, parseNumber, sanitizeDecimalInput } from "@/lib/fx/format";
import { calcStopPips, detectDirection } from "@/lib/fx/pips";

interface PriceInputsProps {
  entryStep: number;
  stopStep: number;
  pairId: string;
  entryPrice: string;
  stopPrice: string;
  onEntryChange: (v: string) => void;
  onStopChange: (v: string) => void;
  onEntryBlur?: () => void;
  onStopBlur?: () => void;
  entryInvalid?: boolean;
  stopInvalid?: boolean;
}

export function PriceInputs({
  entryStep,
  stopStep,
  pairId,
  entryPrice,
  stopPrice,
  onEntryChange,
  onStopChange,
  onEntryBlur,
  onStopBlur,
  entryInvalid,
  stopInvalid,
}: PriceInputsProps) {
  const pair = findPair(pairId);
  const entry = parseNumber(entryPrice);
  const stop = parseNumber(stopPrice);
  const placeholderEntry = pair?.quote === "JPY" ? "147.350" : "1.08500";
  const placeholderStop = pair?.quote === "JPY" ? "146.850" : "1.08000";

  const bothEntered = pair && entry !== null && stop !== null && entry > 0 && stop > 0;
  const pips = bothEntered ? calcStopPips(pair, entry, stop) : null;
  const direction = bothEntered && entry !== stop ? detectDirection(entry, stop) : null;

  return (
    <>
      <Card>
        <StepHeading step={entryStep} title="エントリー" hint="入る予定の価格" htmlFor="entryPrice" />
        <TextField
          id="entryPrice"
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholderEntry}
          value={entryPrice}
          onChange={(v) => onEntryChange(sanitizeDecimalInput(v))}
          onBlur={onEntryBlur}
          invalid={entryInvalid}
        />
      </Card>
      <Card>
        <StepHeading step={stopStep} title="損切り" hint="ここまで来たら諦める価格" htmlFor="stopPrice" />
        <TextField
          id="stopPrice"
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholderStop}
          value={stopPrice}
          onChange={(v) => onStopChange(sanitizeDecimalInput(v))}
          onBlur={onStopBlur}
          invalid={stopInvalid}
        />
        <div
          className="mt-3 flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3 text-sm dark:bg-slate-800"
          aria-live="polite"
        >
          <span className="text-slate-600 dark:text-slate-300">損切り幅：</span>
          <span className="text-right">
            <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
              {pips !== null ? `${formatPips(pips)} pips` : "―"}
            </span>
            {direction && (
              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                {direction === "long" ? "買い（ロング）" : "売り（ショート）"}
              </span>
            )}
          </span>
        </div>
      </Card>
    </>
  );
}
