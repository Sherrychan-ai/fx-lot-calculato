/**
 * ドメイン型定義。
 * UI から独立した純粋な型のみを置く。将来「利確価格」「リスクリワード」
 * 「トレード日誌」などを追加する際は、ここに型を追加していく。
 */

/** 通貨コード（追加する場合はここに追記） */
export type CurrencyCode =
  | "USD"
  | "JPY"
  | "EUR"
  | "GBP"
  | "AUD"
  | "NZD"
  | "CHF"
  | "CAD";

/** 通貨ペア定義 */
export interface CurrencyPair {
  /** 一意な ID（例: "USDJPY"） */
  id: string;
  /** 表示名（例: "USD/JPY"） */
  label: string;
  base: CurrencyCode;
  quote: CurrencyCode;
  /** 1pips の値幅（JPY クォートは 0.01、それ以外は 0.0001） */
  pipSize: number;
  /** 価格入力時の小数桁の目安（例: 147.350 → 3） */
  priceDecimals: number;
}

/** 1ロットあたりの通貨数量 */
export type LotSize = 1000 | 10000 | 100000;

/** 発注可能なロット単位 */
export type LotStep = 0.01 | 0.1 | 1;

/** 取引条件の設定 */
export interface TradeSettings {
  lotSize: LotSize;
  lotStep: LotStep;
}

/**
 * 円換算に使うレート群。
 * 現状は USD/JPY のみだが、将来 EUR/GBP などのクロスペアを追加する場合は
 * ここにレートを増やし、conversion.ts の解決ロジックを拡張する。
 */
export interface ConversionRates {
  usdJpy?: number | null;
}

/** 計算モード */
export type CalculatorMode = "forward" | "reverse";

/** 通常モード（損切り幅 → ロット）の入力 */
export interface ForwardInput {
  balance: number | null;
  riskPercent: number | null;
  pairId: string;
  entryPrice: number | null;
  stopPrice: number | null;
  rates: ConversionRates;
  settings: TradeSettings;
}

/** 逆算モード（ロット → 損切り幅）の入力 */
export interface ReverseInput {
  balance: number | null;
  riskPercent: number | null;
  pairId: string;
  lots: number | null;
  /** 任意。入力があれば損切り価格の目安も算出し、USD ベース通貨ペアの換算にも使う */
  entryPrice: number | null;
  rates: ConversionRates;
  settings: TradeSettings;
}

/** 売買方向 */
export type TradeDirection = "long" | "short";

/** 通常モードの計算結果 */
export interface ForwardResult {
  pair: CurrencyPair;
  balance: number;
  riskPercent: number;
  /** 許容損失額（円） */
  allowedLoss: number;
  entryPrice: number;
  stopPrice: number;
  direction: TradeDirection;
  /** 損切り幅（pips） */
  stopPips: number;
  /** 1ロットあたり 1pips の損益（円） */
  pipValuePerLot: number;
  /** 切り捨て前のロット数 */
  rawLots: number;
  /** 発注単位で切り捨てたロット数 */
  lots: number;
  /** 適正ロットでの 1pips あたり損益（円） */
  pipValueAtLots: number;
  /** 損切りにかかった場合の想定最大損失（円） */
  maxLoss: number;
  /** 換算に使ったレート（JPY クォートなら null） */
  conversionRateUsed: number | null;
  settings: TradeSettings;
}

/** 逆算モードの計算結果 */
export interface ReverseResult {
  pair: CurrencyPair;
  balance: number;
  riskPercent: number;
  allowedLoss: number;
  lots: number;
  pipValuePerLot: number;
  pipValueAtLots: number;
  /** 最大損切り幅（pips、0.1pips 単位で切り捨て） */
  maxPips: number;
  /** 最大損切り幅での想定損失（円） */
  maxLoss: number;
  /** エントリー価格が入力されていれば損切り価格の目安 */
  entryPrice: number | null;
  stopPriceLong: number | null;
  stopPriceShort: number | null;
  conversionRateUsed: number | null;
  settings: TradeSettings;
}

/** エラー対象となる入力フィールド名 */
export type FieldName =
  | "balance"
  | "riskPercent"
  | "pairId"
  | "entryPrice"
  | "stopPrice"
  | "lots"
  | "usdJpy";

export interface CalcError {
  field: FieldName;
  message: string;
}

/** 計算結果のラッパー。ok=false の場合は初心者向けエラーメッセージを返す */
export type CalcOutcome<T> =
  | { ok: true; value: T }
  | { ok: false; errors: CalcError[] };

/** リスク警告のレベル */
export type RiskLevel = "normal" | "caution" | "high";
