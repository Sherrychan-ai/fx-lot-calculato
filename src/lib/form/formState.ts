import { DEFAULT_PAIR_ID } from "@/lib/fx/currencyPairs";
import { parseNumber } from "@/lib/fx/format";
import type {
  CalculatorMode,
  ForwardInput,
  LotSize,
  LotStep,
  ReverseInput,
  TradeSettings,
} from "@/lib/fx/types";

/** 許容損失率のプリセット（%） */
export const RISK_PRESETS = [0.5, 1, 1.5, 2, 3] as const;
export const DEFAULT_RISK_PRESET = 1;

export const LOT_SIZE_OPTIONS: readonly { value: LotSize; label: string }[] = [
  { value: 1_000, label: "1,000通貨" },
  { value: 10_000, label: "10,000通貨" },
  { value: 100_000, label: "100,000通貨" },
];

export const LOT_STEP_OPTIONS: readonly { value: LotStep; label: string }[] = [
  { value: 0.01, label: "0.01 LOT" },
  { value: 0.1, label: "0.1 LOT" },
  { value: 1, label: "1 LOT" },
];

export type RiskMode = "preset" | "custom";

/**
 * 画面の入力状態。すべて文字列で保持し、計算時に数値へ変換する。
 * （入力途中の "147." のような値を壊さないため）
 *
 * 将来「利確価格」「リスクリワード」を追加する場合は、ここにフィールドを追加し、
 * toForwardInput で ForwardInput に渡す。
 */
export interface CalculatorFormState {
  mode: CalculatorMode;
  /** 口座資金（数字のみの文字列。表示時にカンマを付ける） */
  balance: string;
  riskMode: RiskMode;
  riskPreset: number;
  riskCustom: string;
  pairId: string;
  entryPrice: string;
  stopPrice: string;
  /** 逆算モードのロット数 */
  lots: string;
  usdJpy: string;
  settings: TradeSettings;
}

export const DEFAULT_FORM_STATE: CalculatorFormState = {
  mode: "forward",
  balance: "",
  riskMode: "preset",
  riskPreset: DEFAULT_RISK_PRESET,
  riskCustom: "",
  pairId: DEFAULT_PAIR_ID,
  entryPrice: "",
  stopPrice: "",
  lots: "",
  usdJpy: "",
  settings: { lotSize: 10_000, lotStep: 0.01 },
};

/** 現在選択中の許容損失率（%）。未入力なら null */
export function resolveRiskPercent(form: CalculatorFormState): number | null {
  if (form.riskMode === "preset") return form.riskPreset;
  return parseNumber(form.riskCustom);
}

export function toForwardInput(form: CalculatorFormState): ForwardInput {
  return {
    balance: parseNumber(form.balance),
    riskPercent: resolveRiskPercent(form),
    pairId: form.pairId,
    entryPrice: parseNumber(form.entryPrice),
    stopPrice: parseNumber(form.stopPrice),
    rates: { usdJpy: parseNumber(form.usdJpy) },
    settings: form.settings,
  };
}

export function toReverseInput(form: CalculatorFormState): ReverseInput {
  return {
    balance: parseNumber(form.balance),
    riskPercent: resolveRiskPercent(form),
    pairId: form.pairId,
    lots: parseNumber(form.lots),
    entryPrice: parseNumber(form.entryPrice),
    rates: { usdJpy: parseNumber(form.usdJpy) },
    settings: form.settings,
  };
}

const LOT_SIZES: readonly number[] = LOT_SIZE_OPTIONS.map((o) => o.value);
const LOT_STEPS: readonly number[] = LOT_STEP_OPTIONS.map((o) => o.value);

function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

/**
 * localStorage から読み込んだ値を安全に FormState へ変換する。
 * 壊れたデータや古い形式でも例外を出さず、初期値で補う。
 */
export function sanitizeFormState(raw: unknown): CalculatorFormState {
  if (!raw || typeof raw !== "object") return DEFAULT_FORM_STATE;
  const r = raw as Record<string, unknown>;
  const s = (r.settings ?? {}) as Record<string, unknown>;
  const riskPreset =
    typeof r.riskPreset === "number" &&
    (RISK_PRESETS as readonly number[]).includes(r.riskPreset)
      ? r.riskPreset
      : DEFAULT_RISK_PRESET;
  return {
    mode: r.mode === "reverse" ? "reverse" : "forward",
    balance: str(r.balance, "").replace(/[^0-9]/g, ""),
    riskMode: r.riskMode === "custom" ? "custom" : "preset",
    riskPreset,
    riskCustom: str(r.riskCustom, ""),
    pairId: str(r.pairId, DEFAULT_PAIR_ID),
    entryPrice: str(r.entryPrice, ""),
    stopPrice: str(r.stopPrice, ""),
    lots: str(r.lots, ""),
    usdJpy: str(r.usdJpy, ""),
    settings: {
      lotSize: (typeof s.lotSize === "number" && LOT_SIZES.includes(s.lotSize)
        ? s.lotSize
        : 10_000) as LotSize,
      lotStep: (typeof s.lotStep === "number" && LOT_STEPS.includes(s.lotStep)
        ? s.lotStep
        : 0.01) as LotStep,
    },
  };
}
