import type { LotStep } from "./types";

const EPSILON = 1e-9;

/** 発注単位の小数桁数（0.01 → 2, 0.1 → 1, 1 → 0） */
export function lotStepDecimals(step: LotStep): number {
  if (step >= 1) return 0;
  return Math.round(-Math.log10(step));
}

/**
 * ロット数を発注単位で「必ず切り捨て」る。
 * 1.876 LOT / 0.1 LOT 単位 → 1.8 LOT（1.9 にはしない）
 * 浮動小数点誤差で 0.29 / 0.01 = 28.999… となるケースを EPSILON で吸収する。
 */
export function floorLots(lots: number, step: LotStep): number {
  if (!Number.isFinite(lots) || lots <= 0) return 0;
  const units = Math.floor(lots / step + EPSILON);
  const decimals = lotStepDecimals(step);
  const factor = 10 ** decimals;
  return Math.round(units * step * factor) / factor;
}

/** pips を 0.1pips 単位で切り捨てる（逆算モードで損失額を超えないようにする） */
export function floorPips(pips: number): number {
  if (!Number.isFinite(pips) || pips <= 0) return 0;
  return Math.floor(pips * 10 + EPSILON) / 10;
}

/** 円を整数に切り捨て */
export function floorYen(value: number): number {
  return Math.floor(value + EPSILON);
}
