import { describe, expect, it } from "vitest";
import { calcAllowedLoss, judgeRiskLevel } from "../risk";

describe("calcAllowedLoss", () => {
  it("1,000,000円 × 1% = 10,000円", () => {
    expect(calcAllowedLoss(1_000_000, 1)).toBe(10_000);
  });
  it("1,000,000円 × 0.5% = 5,000円", () => {
    expect(calcAllowedLoss(1_000_000, 0.5)).toBe(5_000);
  });
  it("300,000円 × 1.5% = 4,500円", () => {
    expect(calcAllowedLoss(300_000, 1.5)).toBe(4_500);
  });
  it("円未満は切り捨てる", () => {
    expect(calcAllowedLoss(123_456, 1)).toBe(1_234);
  });
});

describe("judgeRiskLevel", () => {
  it("2% 以下は normal", () => {
    expect(judgeRiskLevel(1)).toBe("normal");
    expect(judgeRiskLevel(2)).toBe("normal");
  });
  it("2% 超 3% 未満は caution", () => {
    expect(judgeRiskLevel(2.1)).toBe("caution");
    expect(judgeRiskLevel(2.9)).toBe("caution");
  });
  it("3% 以上は high", () => {
    expect(judgeRiskLevel(3)).toBe("high");
    expect(judgeRiskLevel(10)).toBe("high");
  });
  it("未入力は normal", () => {
    expect(judgeRiskLevel(null)).toBe("normal");
  });
});
