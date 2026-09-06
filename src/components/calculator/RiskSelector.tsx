"use client";

import { Card } from "@/components/ui/Card";
import { Notice } from "@/components/ui/Notice";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StepHeading } from "@/components/ui/StepHeading";
import { TextField } from "@/components/ui/TextField";
import { RISK_PRESETS, type RiskMode } from "@/lib/form/formState";
import { formatYen, sanitizeDecimalInput } from "@/lib/fx/format";
import { RISK_MESSAGES, judgeRiskLevel } from "@/lib/fx/risk";

const CUSTOM = "custom" as const;
type RiskChoice = number | typeof CUSTOM;

const OPTIONS: readonly { value: RiskChoice; label: string }[] = [
  ...RISK_PRESETS.map((p) => ({ value: p, label: `${p}%` })),
  { value: CUSTOM, label: "自由入力" },
];

interface RiskSelectorProps {
  step: number;
  riskMode: RiskMode;
  riskPreset: number;
  riskCustom: string;
  /** 現在の許容損失率（未確定なら null） */
  riskPercent: number | null;
  /** 許容損失額（資金未入力なら null） */
  allowedLoss: number | null;
  onChange: (patch: { riskMode?: RiskMode; riskPreset?: number; riskCustom?: string }) => void;
  onBlur?: () => void;
  invalid?: boolean;
}

export function RiskSelector({
  step,
  riskMode,
  riskPreset,
  riskCustom,
  riskPercent,
  allowedLoss,
  onChange,
  onBlur,
  invalid,
}: RiskSelectorProps) {
  const choice: RiskChoice = riskMode === "custom" ? CUSTOM : riskPreset;
  const level = judgeRiskLevel(riskPercent);
  const riskMessage = RISK_MESSAGES[level];

  return (
    <Card>
      <StepHeading step={step} title="リスク" hint="1回のトレードで許容する損失率" />
      <SegmentedControl
        aria-label="許容損失率"
        value={choice}
        options={OPTIONS}
        columns={3}
        onChange={(v) => {
          if (v === CUSTOM) onChange({ riskMode: "custom" });
          else onChange({ riskMode: "preset", riskPreset: v });
        }}
      />
      {riskMode === "custom" && (
        <div className="mt-3">
          <label htmlFor="riskCustom" className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
            許容損失率を入力
          </label>
          <TextField
            id="riskCustom"
            inputMode="decimal"
            autoComplete="off"
            placeholder="1.2"
            suffix="%"
            value={riskCustom}
            onChange={(v) => onChange({ riskCustom: sanitizeDecimalInput(v) })}
            onBlur={onBlur}
            invalid={invalid}
          />
        </div>
      )}

      <div className="mt-3 rounded-xl bg-slate-100 px-4 py-3 text-sm dark:bg-slate-800">
        <span className="text-slate-600 dark:text-slate-300">今回許容できる損失額：</span>
        <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
          {allowedLoss !== null ? `${formatYen(allowedLoss)}円` : "―"}
        </span>
        {allowedLoss === null && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            資金と損失率を入力すると表示されます
          </p>
        )}
      </div>

      {riskMessage && (
        <Notice tone={level === "high" ? "danger" : "caution"} className="mt-3" role="status">
          <span className="font-bold">{level === "high" ? "⚠ 注意：" : "！ "}</span>
          {riskMessage}
        </Notice>
      )}
    </Card>
  );
}
