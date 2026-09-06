import { lotStepDecimals } from "./rounding";
import type { CurrencyPair, LotStep } from "./types";

/** 1000000 → "1,000,000" */
export function formatYen(value: number): string {
  return Math.round(value).toLocaleString("ja-JP");
}

/** 1 → "1%", 0.5 → "0.5%", 1.5 → "1.5%" */
export function formatPercent(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded}%`;
}

/** 50 → "50.0" */
export function formatPips(value: number): string {
  return value.toFixed(1);
}

/** 50 → "50", 12.5 → "12.5"（コピー用の短い表記） */
export function formatPipsShort(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded}`;
}

/** 発注単位に応じた桁数でロットを表示（0.01 単位なら "2.00"） */
export function formatLots(value: number, step: LotStep): string {
  return value.toFixed(lotStepDecimals(step));
}

/** 通貨ペアに応じた桁数で価格を表示（USD/JPY → 147.350） */
export function formatPrice(value: number, pair: Pick<CurrencyPair, "priceDecimals">): string {
  return value.toFixed(pair.priceDecimals);
}

/** 1ロットの通貨数量表示 */
export function formatLotSize(lotSize: number): string {
  return `${lotSize.toLocaleString("ja-JP")}通貨`;
}

/** 入力文字列 → 数値。空文字や不正値は null */
export function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").replace(/[０-９．]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0),
  ).trim();
  if (cleaned === "" || cleaned === "." || cleaned === "-") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/** 整数入力用：カンマ・全角を除いた数字だけを残す */
export function sanitizeIntegerInput(raw: string): string {
  return raw
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[^0-9]/g, "");
}

/** 小数入力用：数字と小数点だけを残す */
export function sanitizeDecimalInput(raw: string): string {
  const half = raw.replace(/[０-９．]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0),
  );
  const cleaned = half.replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return (
    cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "")
  );
}

/** "1000000" → "1,000,000"（入力欄の表示用） */
export function formatWithCommas(digits: string): string {
  if (digits === "") return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
