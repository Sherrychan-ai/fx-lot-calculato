"use client";

import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { StepHeading } from "@/components/ui/StepHeading";
import { EducationMessages } from "./EducationMessages";
import { ResultActions } from "./ResultActions";
import { StatItem } from "./StatItem";
import { buildForwardCopyText } from "@/lib/fx/copyText";
import {
  formatLotSize,
  formatLots,
  formatPercent,
  formatPips,
  formatYen,
} from "@/lib/fx/format";
import type { ForwardResult } from "@/lib/fx/types";

interface ForwardResultCardProps {
  step: number;
  result: ForwardResult;
  onReset: () => void;
}

export function ForwardResultCard({ step, result, onReset }: ForwardResultCardProps) {
  const lotsText = formatLots(result.lots, result.settings.lotStep);
  const tooSmall = result.lots <= 0;

  return (
    <Card className="border-indigo-200 dark:border-indigo-900">
      <StepHeading step={step} title="結果" />

      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 px-5 py-6 text-center text-white shadow-md dark:from-indigo-500 dark:to-indigo-400">
        <p className="text-sm font-semibold opacity-90">適正ロット数</p>
        <p className="mt-1 text-5xl font-extrabold tabular-nums tracking-tight" aria-live="polite">
          {lotsText}
          <span className="ml-2 text-2xl font-bold">LOT</span>
        </p>
        <p className="mt-2 text-xs opacity-80">
          1ロット＝{formatLotSize(result.settings.lotSize)} / {result.settings.lotStep} LOT 単位で切り捨て
        </p>
      </div>

      {tooSmall && (
        <Notice tone="caution" className="mt-3" role="status">
          この条件では、最小の発注単位でも許容損失額を超えてしまいます。
          損切り幅を狭くする、資金に対する損失率を見直す、または発注単位が小さいFX会社を検討してください。
        </Notice>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <StatItem
          label="許容損失額"
          value={`${formatYen(result.allowedLoss)}円`}
          sub={`資金の ${formatPercent(result.riskPercent)}`}
        />
        <StatItem label="損切り幅" value={`${formatPips(result.stopPips)} pips`} sub={result.direction === "long" ? "買い（ロング）" : "売り（ショート）"} />
        <StatItem
          label="1pipsあたり"
          value={`${formatYen(result.pipValueAtLots)}円`}
          sub={`1ロットあたり ${formatYen(result.pipValuePerLot)}円`}
        />
        <StatItem
          label="損切りにかかった場合"
          value={`約${formatYen(result.maxLoss)}円の損失`}
          sub="許容損失額以内です"
        />
      </div>

      {result.conversionRateUsed !== null && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          円換算レート（{result.pair.quote}/JPY）：{result.conversionRateUsed.toFixed(3)} を使用
        </p>
      )}

      <div className="mt-4">
        <EducationMessages mode="forward" />
      </div>

      <div className="mt-4">
        <ResultActions copyText={buildForwardCopyText(result)} onReset={onReset} />
      </div>
    </Card>
  );
}
