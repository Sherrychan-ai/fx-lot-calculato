"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { LOT_SIZE_OPTIONS, LOT_STEP_OPTIONS } from "@/lib/form/formState";
import type { LotSize, LotStep, TradeSettings } from "@/lib/fx/types";

interface TradeSettingsPanelProps {
  settings: TradeSettings;
  onChange: (settings: TradeSettings) => void;
}

/** 1ロットの通貨数量と発注単位。普段は折りたたんでおく */
export function TradeSettingsPanel({ settings, onChange }: TradeSettingsPanelProps) {
  const lotSizeLabel = LOT_SIZE_OPTIONS.find((o) => o.value === settings.lotSize)?.label;
  const lotStepLabel = LOT_STEP_OPTIONS.find((o) => o.value === settings.lotStep)?.label;
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        <span>
          <span aria-hidden="true">⚙️ </span>取引条件の設定
          <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
            1ロット={lotSizeLabel} / {lotStepLabel}単位
          </span>
        </span>
        <span
          aria-hidden="true"
          className="text-slate-400 transition group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="space-y-4 border-t border-slate-200 px-4 py-4 dark:border-slate-800">
        <div>
          <p className="mb-2 text-sm font-semibold">1ロットあたりの通貨数量</p>
          <SegmentedControl<LotSize>
            aria-label="1ロットあたりの通貨数量"
            value={settings.lotSize}
            options={LOT_SIZE_OPTIONS}
            size="sm"
            onChange={(lotSize) => onChange({ ...settings, lotSize })}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            国内FXは 10,000通貨、海外FXは 100,000通貨が一般的です。
          </p>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">発注できるロット単位</p>
          <SegmentedControl<LotStep>
            aria-label="発注できるロット単位"
            value={settings.lotStep}
            options={LOT_STEP_OPTIONS}
            size="sm"
            onChange={(lotStep) => onChange({ ...settings, lotStep })}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            結果はこの単位で切り捨てます（損失額を超えないため）。
          </p>
        </div>
      </div>
    </details>
  );
}
