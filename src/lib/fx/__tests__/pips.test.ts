import { describe, expect, it } from "vitest";
import { findPair } from "../currencyPairs";
import { calcStopPips, detectDirection, pipsToPrice } from "../pips";

const USDJPY = findPair("USDJPY")!;
const EURUSD = findPair("EURUSD")!;

describe("calcStopPips", () => {
  it("USD/JPY: 147.350 → 146.850 は 50.0 pips", () => {
    expect(calcStopPips(USDJPY, 147.35, 146.85)).toBe(50);
  });

  it("USD/JPY: 逆方向（売り）でも絶対値で計算する", () => {
    expect(calcStopPips(USDJPY, 146.85, 147.35)).toBe(50);
  });

  it("USD/JPY: 0.1pips 単位の端数も扱える", () => {
    expect(calcStopPips(USDJPY, 147.35, 147.234)).toBe(11.6);
  });

  it("EUR/USD: 1.0850 → 1.0800 は 50.0 pips", () => {
    expect(calcStopPips(EURUSD, 1.085, 1.08)).toBe(50);
  });

  it("EUR/USD: 5桁目（0.00001）は 0.1 pips", () => {
    expect(calcStopPips(EURUSD, 1.08505, 1.085)).toBe(0.5);
  });

  it("差が 0 なら 0 pips", () => {
    expect(calcStopPips(USDJPY, 147.35, 147.35)).toBe(0);
  });
});

describe("detectDirection", () => {
  it("損切りがエントリーより下なら買い", () => {
    expect(detectDirection(147.35, 146.85)).toBe("long");
  });
  it("損切りがエントリーより上なら売り", () => {
    expect(detectDirection(147.35, 147.85)).toBe("short");
  });
});

describe("pipsToPrice", () => {
  it("USD/JPY: 50 pips は 0.500", () => {
    expect(pipsToPrice(USDJPY, 50)).toBe(0.5);
  });
  it("EUR/USD: 50 pips は 0.0050", () => {
    expect(pipsToPrice(EURUSD, 50)).toBe(0.005);
  });
});
