import { describe, expect, it } from "vitest";
import {
  calcPipValuePerLot,
  requiresConversionRate,
  resolveQuoteToJpyRate,
} from "../conversion";
import { CURRENCY_PAIRS, findPair, pipSizeForQuote } from "../currencyPairs";

const USDJPY = findPair("USDJPY")!;
const EURUSD = findPair("EURUSD")!;
const USDCHF = findPair("USDCHF")!;

describe("currencyPairs", () => {
  it("必須の 10 ペアが定義されている", () => {
    const ids = CURRENCY_PAIRS.map((p) => p.id);
    expect(ids).toEqual([
      "USDJPY", "EURJPY", "GBPJPY", "AUDJPY", "NZDJPY",
      "EURUSD", "GBPUSD", "AUDUSD", "USDCHF", "USDCAD",
    ]);
  });
  it("JPY クォートは 0.01、それ以外は 0.0001", () => {
    expect(pipSizeForQuote("JPY")).toBe(0.01);
    expect(pipSizeForQuote("USD")).toBe(0.0001);
    expect(USDJPY.pipSize).toBe(0.01);
    expect(EURUSD.pipSize).toBe(0.0001);
    expect(USDCHF.pipSize).toBe(0.0001);
  });
});

describe("requiresConversionRate", () => {
  it("クロス円は不要、それ以外は必要", () => {
    expect(requiresConversionRate(USDJPY)).toBe(false);
    expect(requiresConversionRate(findPair("EURJPY")!)).toBe(false);
    expect(requiresConversionRate(EURUSD)).toBe(true);
    expect(requiresConversionRate(USDCHF)).toBe(true);
  });
});

describe("resolveQuoteToJpyRate", () => {
  it("JPY クォートは常に 1", () => {
    expect(resolveQuoteToJpyRate(USDJPY, {}, null)).toBe(1);
  });
  it("USD クォートは USD/JPY レートそのもの", () => {
    expect(resolveQuoteToJpyRate(EURUSD, { usdJpy: 150 }, 1.08)).toBe(150);
  });
  it("USD ベース（USD/CHF）は USD/JPY ÷ 通貨ペア価格", () => {
    expect(resolveQuoteToJpyRate(USDCHF, { usdJpy: 150 }, 0.9)).toBeCloseTo(166.6667, 3);
  });
  it("USD/JPY 未入力なら null", () => {
    expect(resolveQuoteToJpyRate(EURUSD, {}, 1.08)).toBeNull();
    expect(resolveQuoteToJpyRate(EURUSD, { usdJpy: 0 }, 1.08)).toBeNull();
  });
  it("USD ベースで価格が無ければ null", () => {
    expect(resolveQuoteToJpyRate(USDCHF, { usdJpy: 150 }, null)).toBeNull();
  });
});

describe("calcPipValuePerLot", () => {
  it("USD/JPY 1ロット=10,000通貨 → 100円", () => {
    expect(calcPipValuePerLot(USDJPY, 10_000, 1)).toBe(100);
  });
  it("USD/JPY 1ロット=1,000通貨 → 10円、100,000通貨 → 1,000円", () => {
    expect(calcPipValuePerLot(USDJPY, 1_000, 1)).toBe(10);
    expect(calcPipValuePerLot(USDJPY, 100_000, 1)).toBe(1_000);
  });
  it("EUR/USD 1ロット=10,000通貨, USD/JPY=150 → 150円", () => {
    expect(calcPipValuePerLot(EURUSD, 10_000, 150)).toBeCloseTo(150, 6);
  });
});
