import type { CurrencyCode, CurrencyPair } from "./types";

export const JPY_PIP_SIZE = 0.01;
export const STANDARD_PIP_SIZE = 0.0001;

/** クォート通貨から pips の値幅を決める */
export function pipSizeForQuote(quote: CurrencyCode): number {
  return quote === "JPY" ? JPY_PIP_SIZE : STANDARD_PIP_SIZE;
}

function definePair(base: CurrencyCode, quote: CurrencyCode): CurrencyPair {
  const pipSize = pipSizeForQuote(quote);
  return {
    id: `${base}${quote}`,
    label: `${base}/${quote}`,
    base,
    quote,
    pipSize,
    priceDecimals: quote === "JPY" ? 3 : 5,
  };
}

/**
 * 対応通貨ペア一覧。
 * 追加したい場合はこの配列に definePair(...) を足すだけでよい。
 * （クォート通貨が JPY / USD 以外、かつベース通貨が USD 以外のペアを追加する場合は
 *  conversion.ts の換算ルールも追加すること）
 */
export const CURRENCY_PAIRS: readonly CurrencyPair[] = [
  definePair("USD", "JPY"),
  definePair("EUR", "JPY"),
  definePair("GBP", "JPY"),
  definePair("AUD", "JPY"),
  definePair("NZD", "JPY"),
  definePair("EUR", "USD"),
  definePair("GBP", "USD"),
  definePair("AUD", "USD"),
  definePair("USD", "CHF"),
  definePair("USD", "CAD"),
];

export const DEFAULT_PAIR_ID = "USDJPY";

export function findPair(id: string): CurrencyPair | undefined {
  return CURRENCY_PAIRS.find((p) => p.id === id);
}
