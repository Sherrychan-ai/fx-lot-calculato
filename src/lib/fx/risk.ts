import type { RiskLevel } from "./types";

/** 許容損失額 = 口座資金 × 許容損失率（円未満は切り捨て） */
export function calcAllowedLoss(balance: number, riskPercent: number): number {
  return Math.floor((balance * riskPercent) / 100 + 1e-9);
}

/**
 * リスクレベル判定。
 * 2% 超 → caution（リスクが高め）
 * 3% 以上 → high（高いリスク設定）
 */
export function judgeRiskLevel(riskPercent: number | null): RiskLevel {
  if (riskPercent === null || !Number.isFinite(riskPercent)) return "normal";
  if (riskPercent >= 3) return "high";
  if (riskPercent > 2) return "caution";
  return "normal";
}

export const RISK_MESSAGES: Record<RiskLevel, string | null> = {
  normal: null,
  caution: "リスクが高めです",
  high: "1回のトレードとしては高いリスク設定です。ロット数を下げることを検討してください。",
};
