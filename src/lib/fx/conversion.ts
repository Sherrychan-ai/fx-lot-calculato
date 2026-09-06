import type { ConversionRates, CurrencyPair } from "./types";

/**
 * 通貨ペアが円換算レート（USD/JPY）を必要とするかどうか。
 * クォート通貨が JPY のペアは不要。
 */
export function requiresConversionRate(pair: CurrencyPair): boolean {
  return pair.quote !== "JPY";
}

/**
 * 「クォート通貨 1 単位 = 何円か」を解決する。
 *
 * - quote = JPY  → 1
 * - quote = USD  → USD/JPY レート
 * - base  = USD  → USD/JPY ÷ 通貨ペア価格（例: CHF/JPY = USD/JPY ÷ USD/CHF）
 *
 * 解決できない場合は null を返す（UI 側で「レートを入力してください」を出す）。
 * 将来 EUR/GBP のようなクロスペアを追加する場合はここに分岐を足す。
 */
export function resolveQuoteToJpyRate(
  pair: CurrencyPair,
  rates: ConversionRates,
  pairPrice: number | null,
): number | null {
  if (pair.quote === "JPY") return 1;

  const usdJpy = rates.usdJpy ?? null;
  if (usdJpy === null || !Number.isFinite(usdJpy) || usdJpy <= 0) return null;

  if (pair.quote === "USD") return usdJpy;

  if (pair.base === "USD") {
    if (pairPrice === null || !Number.isFinite(pairPrice) || pairPrice <= 0) {
      return null;
    }
    return usdJpy / pairPrice;
  }

  return null;
}

/**
 * 1ロットあたりの 1pips 損益（円）。
 *
 * USD/JPY, 1ロット=10,000通貨 → 0.01 × 10,000 = 100円
 * EUR/USD, 1ロット=10,000通貨, USD/JPY=150 → 0.0001 × 10,000 × 150 = 150円
 */
export function calcPipValuePerLot(
  pair: CurrencyPair,
  lotSize: number,
  quoteToJpyRate: number,
): number {
  return pair.pipSize * lotSize * quoteToJpyRate;
}
