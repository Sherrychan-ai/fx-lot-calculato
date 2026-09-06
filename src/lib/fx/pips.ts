import type { CurrencyPair, TradeDirection } from "./types";

/** 小数誤差を吸収して 0.1pips 単位に丸める */
export function roundPips(pips: number): number {
  return Math.round(pips * 10) / 10;
}

/**
 * エントリー価格と損切り価格から損切り幅（pips）を求める。
 * USD/JPY 147.350 → 146.850 = 50.0 pips
 * EUR/USD 1.0850 → 1.0800 = 50.0 pips
 */
export function calcStopPips(
  pair: Pick<CurrencyPair, "pipSize">,
  entryPrice: number,
  stopPrice: number,
): number {
  const diff = Math.abs(entryPrice - stopPrice);
  return roundPips(diff / pair.pipSize);
}

/** 損切り価格がエントリーより下なら買い（ロング）、上なら売り（ショート） */
export function detectDirection(
  entryPrice: number,
  stopPrice: number,
): TradeDirection {
  return stopPrice < entryPrice ? "long" : "short";
}

/** pips を価格差に戻す（逆算モードで損切り価格の目安を出すときに使う） */
export function pipsToPrice(
  pair: Pick<CurrencyPair, "pipSize" | "priceDecimals">,
  pips: number,
): number {
  const value = pips * pair.pipSize;
  const factor = 10 ** pair.priceDecimals;
  return Math.round(value * factor) / factor;
}
