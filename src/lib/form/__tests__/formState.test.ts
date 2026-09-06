import { describe, expect, it } from "vitest";
import {
  DEFAULT_FORM_STATE,
  resolveRiskPercent,
  sanitizeFormState,
  toForwardInput,
  toReverseInput,
} from "../formState";

describe("formState", () => {
  it("初期値は 1%・USD/JPY・10,000通貨・0.01 LOT", () => {
    expect(resolveRiskPercent(DEFAULT_FORM_STATE)).toBe(1);
    expect(DEFAULT_FORM_STATE.pairId).toBe("USDJPY");
    expect(DEFAULT_FORM_STATE.settings).toEqual({ lotSize: 10_000, lotStep: 0.01 });
  });

  it("自由入力の許容損失率を数値にする", () => {
    expect(
      resolveRiskPercent({ ...DEFAULT_FORM_STATE, riskMode: "custom", riskCustom: "2.5" }),
    ).toBe(2.5);
    expect(
      resolveRiskPercent({ ...DEFAULT_FORM_STATE, riskMode: "custom", riskCustom: "" }),
    ).toBeNull();
  });

  it("toForwardInput は文字列を数値へ変換する（未入力は null）", () => {
    const input = toForwardInput({
      ...DEFAULT_FORM_STATE,
      balance: "1000000",
      entryPrice: "147.350",
      stopPrice: "",
    });
    expect(input.balance).toBe(1_000_000);
    expect(input.entryPrice).toBe(147.35);
    expect(input.stopPrice).toBeNull();
    expect(input.rates.usdJpy).toBeNull();
  });

  it("toReverseInput", () => {
    const input = toReverseInput({ ...DEFAULT_FORM_STATE, balance: "500000", lots: "1.5" });
    expect(input.balance).toBe(500_000);
    expect(input.lots).toBe(1.5);
  });

  it("sanitizeFormState は壊れたデータでも初期値で補う", () => {
    expect(sanitizeFormState(null)).toEqual(DEFAULT_FORM_STATE);
    expect(sanitizeFormState("junk")).toEqual(DEFAULT_FORM_STATE);
    const partial = sanitizeFormState({
      mode: "reverse",
      balance: "1,000,000",
      riskPreset: 99,
      settings: { lotSize: 5, lotStep: 0.1 },
    });
    expect(partial.mode).toBe("reverse");
    expect(partial.balance).toBe("1000000");
    expect(partial.riskPreset).toBe(1);
    expect(partial.settings).toEqual({ lotSize: 10_000, lotStep: 0.1 });
  });
});
