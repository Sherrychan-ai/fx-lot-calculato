"use client";

import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { SelectField } from "@/components/ui/SelectField";
import { StepHeading } from "@/components/ui/StepHeading";
import { TextField } from "@/components/ui/TextField";
import { requiresConversionRate } from "@/lib/fx/conversion";
import { CURRENCY_PAIRS, findPair } from "@/lib/fx/currencyPairs";
import { sanitizeDecimalInput } from "@/lib/fx/format";

const PAIR_OPTIONS = CURRENCY_PAIRS.map((p) => ({ value: p.id, label: p.label }));

interface PairSelectorProps {
  step: number;
  pairId: string;
  usdJpy: string;
  onPairChange: (pairId: string) => void;
  onUsdJpyChange: (value: string) => void;
  onUsdJpyBlur?: () => void;
  usdJpyInvalid?: boolean;
}

export function PairSelector({
  step,
  pairId,
  usdJpy,
  onPairChange,
  onUsdJpyChange,
  onUsdJpyBlur,
  usdJpyInvalid,
}: PairSelectorProps) {
  const pair = findPair(pairId);
  const needsRate = pair ? requiresConversionRate(pair) : false;
  const isUsdJpyPair = pairId === "USDJPY";

  return (
    <Card>
      <StepHeading step={step} title="通貨ペア" htmlFor="pair" />
      <SelectField id="pair" value={pairId} options={PAIR_OPTIONS} onChange={onPairChange} />

      {pair && needsRate && (
        <div className="mt-3">
          <Notice tone="info">
            <span className="font-bold">この通貨ペアは円換算レートが必要です。</span>
            <br />
            {pair.label} の損益は {pair.quote} 建てになるため、今の
            <span className="font-semibold"> USD/JPY </span>
            のレートを入力してください。
            {pair.base === "USD" && (
              <>
                <br />
                <span className="text-xs">
                  （{pair.quote}→円の換算は「USD/JPY ÷ {pair.label} の価格」で自動計算します）
                </span>
              </>
            )}
          </Notice>
          <label htmlFor="usdJpy" className="mt-3 mb-1 block text-sm text-slate-600 dark:text-slate-300">
            USD/JPY のレート
          </label>
          <TextField
            id="usdJpy"
            inputMode="decimal"
            autoComplete="off"
            placeholder="150.000"
            value={usdJpy}
            onChange={(v) => onUsdJpyChange(sanitizeDecimalInput(v))}
            onBlur={onUsdJpyBlur}
            invalid={usdJpyInvalid}
          />
        </div>
      )}
      {pair && !needsRate && !isUsdJpyPair && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          円建てのペアなので、換算レートは不要です。
        </p>
      )}
    </Card>
  );
}
