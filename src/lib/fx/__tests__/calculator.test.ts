import { describe, expect, it } from "vitest";
import { calculateForward, calculateReverse } from "../calculator";
import type { ForwardInput, ReverseInput, TradeSettings } from "../types";

const settings: TradeSettings = { lotSize: 10_000, lotStep: 0.01 };

const baseForward: ForwardInput = {
  balance: 1_000_000,
  riskPercent: 1,
  pairId: "USDJPY",
  entryPrice: 147.35,
  stopPrice: 146.85,
  rates: {},
  settings,
};

function forward(overrides: Partial<ForwardInput> = {}) {
  return calculateForward({ ...baseForward, ...overrides });
}

describe("calculateForward（通常モード）", () => {
  it("仕様の例：100万円・1%・USD/JPY 50pips → 2.00 LOT / 200円/pips / 損失 10,000円", () => {
    const r = forward();
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.allowedLoss).toBe(10_000);
    expect(r.value.stopPips).toBe(50);
    expect(r.value.pipValuePerLot).toBe(100);
    expect(r.value.lots).toBe(2);
    expect(r.value.pipValueAtLots).toBe(200);
    expect(r.value.maxLoss).toBe(10_000);
    expect(r.value.direction).toBe("long");
    expect(r.value.conversionRateUsed).toBeNull();
  });

  it("売り（損切りがエントリーより上）でも同じロットになる", () => {
    const r = forward({ entryPrice: 146.85, stopPrice: 147.35 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.direction).toBe("short");
    expect(r.value.lots).toBe(2);
  });

  it("EUR/USD：USD/JPY=150 で 50pips → 10,000 ÷ (50 × 150) = 1.33 LOT", () => {
    const r = forward({
      pairId: "EURUSD",
      entryPrice: 1.085,
      stopPrice: 1.08,
      rates: { usdJpy: 150 },
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.stopPips).toBe(50);
    expect(r.value.pipValuePerLot).toBeCloseTo(150, 6);
    expect(r.value.rawLots).toBeCloseTo(1.3333, 3);
    expect(r.value.lots).toBe(1.33);
    expect(r.value.maxLoss).toBeLessThanOrEqual(10_000);
    expect(r.value.maxLoss).toBe(9_975);
    expect(r.value.conversionRateUsed).toBe(150);
  });

  it("USD/CHF：USD/JPY=150, 価格 0.9 → 1pips = 0.0001×10,000×(150/0.9) ≒ 166.67円", () => {
    const r = forward({
      pairId: "USDCHF",
      entryPrice: 0.9,
      stopPrice: 0.895,
      rates: { usdJpy: 150 },
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.stopPips).toBe(50);
    expect(r.value.pipValuePerLot).toBeCloseTo(166.6667, 3);
    expect(r.value.lots).toBe(1.2);
    expect(r.value.maxLoss).toBeLessThanOrEqual(10_000);
  });

  it("ロットは発注単位で切り捨てる（0.1 LOT 単位）", () => {
    // 100万 × 1% = 10,000 / (53.3 pips × 100円) = 1.876...
    const r = forward({
      entryPrice: 147.35,
      stopPrice: 146.817,
      settings: { lotSize: 10_000, lotStep: 0.1 },
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.stopPips).toBe(53.3);
    expect(r.value.rawLots).toBeCloseTo(1.876, 2);
    expect(r.value.lots).toBe(1.8);
    expect(r.value.maxLoss).toBe(9_594);
  });

  it("1 LOT 単位なら 1 LOT に切り捨て", () => {
    const r = forward({
      entryPrice: 147.35,
      stopPrice: 146.817,
      settings: { lotSize: 10_000, lotStep: 1 },
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.lots).toBe(1);
  });

  it("想定最大損失は常に許容損失額以下", () => {
    const cases = [
      { stopPrice: 146.817, lotStep: 0.01 as const },
      { stopPrice: 147.123, lotStep: 0.01 as const },
      { stopPrice: 147.0, lotStep: 0.1 as const },
      { stopPrice: 146.0, lotStep: 1 as const },
    ];
    for (const c of cases) {
      const r = forward({
        stopPrice: c.stopPrice,
        settings: { lotSize: 10_000, lotStep: c.lotStep },
      });
      expect(r.ok).toBe(true);
      if (!r.ok) continue;
      expect(r.value.maxLoss).toBeLessThanOrEqual(r.value.allowedLoss);
    }
  });

  it("1ロット=1,000通貨 なら 10 倍のロット数になる", () => {
    const r = forward({ settings: { lotSize: 1_000, lotStep: 0.01 } });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.pipValuePerLot).toBe(10);
    expect(r.value.lots).toBe(20);
  });

  it("1ロット=100,000通貨 なら 0.2 LOT", () => {
    const r = forward({ settings: { lotSize: 100_000, lotStep: 0.01 } });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.pipValuePerLot).toBe(1_000);
    expect(r.value.lots).toBe(0.2);
  });

  it("最小発注単位に満たない場合は 0 LOT（エラーにはしない）", () => {
    const r = forward({ balance: 10_000, riskPercent: 0.5, stopPrice: 140 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.lots).toBe(0);
    expect(r.value.maxLoss).toBe(0);
  });
});

describe("calculateForward のエラー処理", () => {
  function errorFields(input: Partial<ForwardInput>) {
    const r = forward(input);
    expect(r.ok).toBe(false);
    return r.ok ? [] : r.errors.map((e) => e.field);
  }
  function errorMessages(input: Partial<ForwardInput>) {
    const r = forward(input);
    return r.ok ? [] : r.errors.map((e) => e.message);
  }

  it("口座資金が未入力", () => {
    expect(errorFields({ balance: null })).toContain("balance");
    expect(errorMessages({ balance: null })).toContain("口座資金を入力してください");
  });
  it("口座資金が 0 以下", () => {
    expect(errorFields({ balance: 0 })).toContain("balance");
    expect(errorFields({ balance: -100 })).toContain("balance");
  });
  it("許容損失率が 0 以下・未入力", () => {
    expect(errorFields({ riskPercent: 0 })).toContain("riskPercent");
    expect(errorFields({ riskPercent: -1 })).toContain("riskPercent");
    expect(errorFields({ riskPercent: null })).toContain("riskPercent");
  });
  it("エントリー価格・損切り価格が未入力", () => {
    expect(errorMessages({ entryPrice: null })).toContain("エントリー価格を入力してください");
    expect(errorMessages({ stopPrice: null })).toContain("損切り価格を入力してください");
  });
  it("エントリー価格と損切り価格が同じ", () => {
    const fields = errorFields({ entryPrice: 147.35, stopPrice: 147.35 });
    expect(fields).toContain("stopPrice");
  });
  it("価格が 0 以下", () => {
    expect(errorFields({ entryPrice: 0 })).toContain("entryPrice");
    expect(errorFields({ stopPrice: -1 })).toContain("stopPrice");
  });
  it("換算レートが必要なのに未入力（EUR/USD）", () => {
    const fields = errorFields({
      pairId: "EURUSD",
      entryPrice: 1.085,
      stopPrice: 1.08,
      rates: {},
    });
    expect(fields).toContain("usdJpy");
  });
  it("換算レートが 0 以下", () => {
    const fields = errorFields({
      pairId: "EURUSD",
      entryPrice: 1.085,
      stopPrice: 1.08,
      rates: { usdJpy: 0 },
    });
    expect(fields).toContain("usdJpy");
  });
  it("存在しない通貨ペア", () => {
    expect(errorFields({ pairId: "XXXYYY" })).toContain("pairId");
  });
  it("全部未入力でも例外にならず複数のエラーを返す", () => {
    const r = forward({
      balance: null,
      riskPercent: null,
      entryPrice: null,
      stopPrice: null,
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errors.length).toBeGreaterThanOrEqual(4);
  });
  it("NaN や Infinity でも例外にならない", () => {
    expect(() => forward({ balance: NaN })).not.toThrow();
    expect(() => forward({ entryPrice: Infinity })).not.toThrow();
    expect(forward({ balance: NaN }).ok).toBe(false);
    expect(forward({ entryPrice: Infinity }).ok).toBe(false);
  });
});

const baseReverse: ReverseInput = {
  balance: 1_000_000,
  riskPercent: 1,
  pairId: "USDJPY",
  lots: 2,
  entryPrice: null,
  rates: {},
  settings,
};

function reverse(overrides: Partial<ReverseInput> = {}) {
  return calculateReverse({ ...baseReverse, ...overrides });
}

describe("calculateReverse（逆算モード）", () => {
  it("仕様の例：100万円・1%・2 LOT（USD/JPY）→ 最大損切り幅 50 pips", () => {
    const r = reverse();
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.allowedLoss).toBe(10_000);
    expect(r.value.maxPips).toBe(50);
    expect(r.value.pipValueAtLots).toBe(200);
    expect(r.value.maxLoss).toBe(10_000);
    expect(r.value.stopPriceLong).toBeNull();
  });

  it("エントリー価格があれば買い・売りの損切り価格の目安を返す", () => {
    const r = reverse({ entryPrice: 147.35 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.stopPriceLong).toBe(146.85);
    expect(r.value.stopPriceShort).toBe(147.85);
  });

  it("割り切れない場合は 0.1pips 単位で切り捨てる", () => {
    // 10,000 / (3 × 100) = 33.333… → 33.3
    const r = reverse({ lots: 3 });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.maxPips).toBe(33.3);
    expect(r.value.maxLoss).toBeLessThanOrEqual(10_000);
  });

  it("EUR/USD：USD/JPY=150, 1 LOT → 10,000 / 150 = 66.6 pips", () => {
    const r = reverse({ pairId: "EURUSD", lots: 1, rates: { usdJpy: 150 } });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.maxPips).toBe(66.6);
  });

  it("USD/CHF はエントリー価格（換算用）が必須", () => {
    const missing = reverse({ pairId: "USDCHF", rates: { usdJpy: 150 } });
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.errors.map((e) => e.field)).toContain("entryPrice");
    }
    const ok = reverse({ pairId: "USDCHF", rates: { usdJpy: 150 }, entryPrice: 0.9, lots: 1 });
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(ok.value.pipValuePerLot).toBeCloseTo(166.6667, 3);
    expect(ok.value.maxPips).toBe(60);
  });

  it("ロット数が 0 以下・未入力はエラー", () => {
    for (const lots of [0, -1, null]) {
      const r = reverse({ lots });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.map((e) => e.field)).toContain("lots");
    }
  });

  it("口座資金 0 はエラー", () => {
    const r = reverse({ balance: 0 });
    expect(r.ok).toBe(false);
  });

  it("換算レートが必要なのに未入力（GBP/USD）", () => {
    const r = reverse({ pairId: "GBPUSD", rates: {} });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.map((e) => e.field)).toContain("usdJpy");
  });
});
