"use client";

import { Card } from "@/components/ui/Card";
import { StepHeading } from "@/components/ui/StepHeading";
import { EducationMessages } from "./EducationMessages";
import { ResultActions } from "./ResultActions";
import { StatItem } from "./StatItem";
import { buildReverseCopyText } from "@/lib/fx/copyText";
import {
  formatLotSize,
  formatLots,
  formatPercent,
  formatPips,
  formatPrice,
  formatYen,
} from "@/lib/fx/format";
import type { ReverseResult } from "@/lib/fx/types";

interface ReverseResultCardProps {
  step: number;
  result: ReverseResult;
  onReset: () => void;
}

export function ReverseResultCard({ step, result, onReset }: ReverseResultCardProps) {
  return (
    <Card className="border-indigo-200 dark:border-indigo-900">
      <StepHeading step={step} title="結果" />

      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 px-5 py-6 text-center text-white shadow-md dark:from-indigo-500 dark:to-indigo-400">
        <p className="text-sm font-semibold opacity-90">最大損切り幅</p>
        <p className="mt-1 text-5xl font-extrabold tabular-nums tracking-tight" aria-live="polite">
          {formatPips(result.maxPips)}
          <span className="ml-2 text-2xl font-bold">pips</span>
        </p>
        <p className="mt-2 text-xs opacity-80">
          {formatLots(result.lots, result.settings.lotStep)} LOT（1ロット＝{formatLotSize(result.settings.lotSize)}）の場合
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <StatItem
          label="許容損失額"
          value={`${formatYen(result.allowedLoss)}円`}
          sub={`資金の ${formatPercent(result.riskPercent)}`}
        />
        <StatItem
          label="1pipsあたり"
          value={`${formatYen(result.pipValueAtLots)}円`}
          sub={`1ロットあたり ${formatYen(result.pipValuePerLot)}円`}
        />
        {result.entryPrice !== null && result.stopPriceLong !== null && result.stopPriceShort !== null ? (
          <>
            <StatItem
              label="買いなら損切り価格"
              value={formatPrice(result.stopPriceLong, result.pair)}
              sub={`エントリー ${formatPrice(result.entryPrice, result.pair)}`}
            />
            <StatItem
              label="売りなら損切り価格"
              value={formatPrice(result.stopPriceShort, result.pair)}
              sub={`エントリー ${formatPrice(result.entryPrice, result.pair)}`}
            />
          </>
        ) : (
          <StatItem
            label="損切りにかかった場合"
            value={`約${formatYen(result.maxLoss)}円の損失`}
            sub="許容損失額以内です"
          />
        )}
      </div>

      {result.conversionRateUsed !== null && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          円換算レート（{result.pair.quote}/JPY）：{result.conversionRateUsed.toFixed(3)} を使用
        </p>
      )}

      <div className="mt-4">
        <EducationMessages mode="reverse" />
      </div>

      <div className="mt-4">
        <ResultActions copyText={buildReverseCopyText(result)} onReset={onReset} />
      </div>
    </Card>
  );
}
