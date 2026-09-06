import { describe, expect, it } from "vitest";
import { calculateForward, calculateReverse } from "../calculator";
import { buildForwardCopyText, buildReverseCopyText } from "../copyText";
import {
  formatLots,
  formatPercent,
  formatPips,
  formatWithCommas,
  formatYen,
  parseNumber,
  sanitizeDecimalInput,
  sanitizeIntegerInput,
} from "../format";

describe("format helpers", () => {
  it("formatYen は 3 桁ごとにカンマ", () => {
    expect(formatYen(1_000_000)).toBe("1,000,000");
    expect(formatYen(10_000)).toBe("10,000");
    expect(formatYen(0)).toBe("0");
  });
  it("formatPercent", () => {
    expect(formatPercent(1)).toBe("1%");
    expect(formatPercent(0.5)).toBe("0.5%");
    expect(formatPercent(1.5)).toBe("1.5%");
  });
  it("formatPips は小数 1 桁", () => {
    expect(formatPips(50)).toBe("50.0");
    expect(formatPips(12.34)).toBe("12.3");
  });
  it("formatLots は発注単位に応じた桁数", () => {
    expect(formatLots(2, 0.01)).toBe("2.00");
    expect(formatLots(1.8, 0.1)).toBe("1.8");
    expect(formatLots(1, 1)).toBe("1");
  });
  it("formatWithCommas", () => {
    expect(formatWithCommas("1000000")).toBe("1,000,000");
    expect(formatWithCommas("")).toBe("");
    expect(formatWithCommas("999")).toBe("999");
  });
  it("parseNumber はカンマ・全角・空文字を扱う", () => {
    expect(parseNumber("1,000,000")).toBe(1_000_000);
    expect(parseNumber("１４７．３５")).toBe(147.35);
    expect(parseNumber("")).toBeNull();
    expect(parseNumber(".")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
  });
  it("sanitize 系", () => {
    expect(sanitizeIntegerInput("1,000,000円")).toBe("1000000");
    expect(sanitizeIntegerInput("１２３")).toBe("123");
    expect(sanitizeDecimalInput("147.35.0")).toBe("147.350");
    expect(sanitizeDecimalInput("１．０８５")).toBe("1.085");
    expect(sanitizeDecimalInput("abc")).toBe("");
  });
});

describe("copy text", () => {
  it("通常モードは仕様どおりの形式", () => {
    const r = calculateForward({
      balance: 1_000_000,
      riskPercent: 1,
      pairId: "USDJPY",
      entryPrice: 147.35,
      stopPrice: 146.85,
      rates: {},
      settings: { lotSize: 10_000, lotStep: 0.01 },
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(buildForwardCopyText(r.value)).toBe(
      [
        "口座資金：1,000,000円",
        "許容損失率：1%",
        "許容損失額：10,000円",
        "通貨ペア：USD/JPY",
        "エントリー：147.350",
        "損切り：146.850",
        "損切り幅：50pips",
        "適正ロット：2.00LOT",
      ].join("\n"),
    );
  });

  it("換算レートを使った場合は末尾に行が追加される", () => {
    const r = calculateForward({
      balance: 1_000_000,
      riskPercent: 1,
      pairId: "EURUSD",
      entryPrice: 1.085,
      stopPrice: 1.08,
      rates: { usdJpy: 150 },
      settings: { lotSize: 10_000, lotStep: 0.01 },
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const text = buildForwardCopyText(r.value);
    expect(text).toContain("通貨ペア：EUR/USD");
    expect(text).toContain("エントリー：1.08500");
    expect(text).toContain("換算レート（USD/JPY）：150.000");
  });

  it("逆算モード", () => {
    const r = calculateReverse({
      balance: 1_000_000,
      riskPercent: 1,
      pairId: "USDJPY",
      lots: 2,
      entryPrice: null,
      rates: {},
      settings: { lotSize: 10_000, lotStep: 0.01 },
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(buildReverseCopyText(r.value)).toBe(
      [
        "口座資金：1,000,000円",
        "許容損失率：1%",
        "許容損失額：10,000円",
        "通貨ペア：USD/JPY",
        "ロット数：2.00LOT",
        "最大損切り幅：50pips",
      ].join("\n"),
    );
  });
});
