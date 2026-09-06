import {
  formatLots,
  formatPercent,
  formatPipsShort,
  formatPrice,
  formatYen,
} from "./format";
import type { ForwardResult, ReverseResult } from "./types";

/**
 * 通常モードの計算結果をコピー用テキストに整形する。
 *
 * 口座資金：1,000,000円
 * 許容損失率：1%
 * 許容損失額：10,000円
 * 通貨ペア：USD/JPY
 * エントリー：147.350
 * 損切り：146.850
 * 損切り幅：50pips
 * 適正ロット：2.00LOT
 */
export function buildForwardCopyText(result: ForwardResult): string {
  const lines = [
    `口座資金：${formatYen(result.balance)}円`,
    `許容損失率：${formatPercent(result.riskPercent)}`,
    `許容損失額：${formatYen(result.allowedLoss)}円`,
    `通貨ペア：${result.pair.label}`,
    `エントリー：${formatPrice(result.entryPrice, result.pair)}`,
    `損切り：${formatPrice(result.stopPrice, result.pair)}`,
    `損切り幅：${formatPipsShort(result.stopPips)}pips`,
    `適正ロット：${formatLots(result.lots, result.settings.lotStep)}LOT`,
  ];
  if (result.conversionRateUsed !== null) {
    lines.push(`換算レート（${result.pair.quote}/JPY）：${result.conversionRateUsed.toFixed(3)}`);
  }
  return lines.join("\n");
}

/** 逆算モードの計算結果をコピー用テキストに整形する */
export function buildReverseCopyText(result: ReverseResult): string {
  const lines = [
    `口座資金：${formatYen(result.balance)}円`,
    `許容損失率：${formatPercent(result.riskPercent)}`,
    `許容損失額：${formatYen(result.allowedLoss)}円`,
    `通貨ペア：${result.pair.label}`,
    `ロット数：${formatLots(result.lots, result.settings.lotStep)}LOT`,
    `最大損切り幅：${formatPipsShort(result.maxPips)}pips`,
  ];
  if (result.entryPrice !== null && result.stopPriceLong !== null && result.stopPriceShort !== null) {
    lines.push(`エントリー：${formatPrice(result.entryPrice, result.pair)}`);
    lines.push(`損切り目安（買い）：${formatPrice(result.stopPriceLong, result.pair)}`);
    lines.push(`損切り目安（売り）：${formatPrice(result.stopPriceShort, result.pair)}`);
  }
  if (result.conversionRateUsed !== null) {
    lines.push(`換算レート（${result.pair.quote}/JPY）：${result.conversionRateUsed.toFixed(3)}`);
  }
  return lines.join("\n");
}
