import { calcPipValuePerLot, resolveQuoteToJpyRate } from "./conversion";
import { calcStopPips, detectDirection, pipsToPrice } from "./pips";
import { calcAllowedLoss } from "./risk";
import { floorLots, floorPips, floorYen } from "./rounding";
import type {
  CalcOutcome,
  ForwardInput,
  ForwardResult,
  ReverseInput,
  ReverseResult,
} from "./types";
import { validateForwardInput, validateReverseInput } from "./validation";

/**
 * 通常モード：損切り幅からロット数を計算する。
 *
 * 適正ロット数 = 許容損失額 ÷（損切り pips × 1ロットあたりの 1pips 損益）
 * 結果は発注単位で必ず切り捨てる。
 */
export function calculateForward(
  input: ForwardInput,
): CalcOutcome<ForwardResult> {
  const { errors, pair } = validateForwardInput(input);
  if (errors.length > 0 || !pair) {
    return { ok: false, errors };
  }

  // validation 済みなので non-null
  const balance = input.balance as number;
  const riskPercent = input.riskPercent as number;
  const entryPrice = input.entryPrice as number;
  const stopPrice = input.stopPrice as number;

  const quoteToJpy = resolveQuoteToJpyRate(pair, input.rates, entryPrice);
  if (quoteToJpy === null) {
    return {
      ok: false,
      errors: [
        {
          field: "usdJpy",
          message: `${pair.label} は円換算が必要です。USD/JPY のレートを入力してください`,
        },
      ],
    };
  }

  const allowedLoss = calcAllowedLoss(balance, riskPercent);
  const stopPips = calcStopPips(pair, entryPrice, stopPrice);
  if (stopPips <= 0) {
    return {
      ok: false,
      errors: [
        {
          field: "stopPrice",
          message:
            "損切り幅が小さすぎて計算できません。損切り価格を見直してください",
        },
      ],
    };
  }

  const pipValuePerLot = calcPipValuePerLot(
    pair,
    input.settings.lotSize,
    quoteToJpy,
  );
  const rawLots = allowedLoss / (stopPips * pipValuePerLot);
  const lots = floorLots(rawLots, input.settings.lotStep);
  const pipValueAtLots = lots * pipValuePerLot;
  const maxLoss = floorYen(pipValueAtLots * stopPips);

  return {
    ok: true,
    value: {
      pair,
      balance,
      riskPercent,
      allowedLoss,
      entryPrice,
      stopPrice,
      direction: detectDirection(entryPrice, stopPrice),
      stopPips,
      pipValuePerLot,
      rawLots,
      lots,
      pipValueAtLots,
      maxLoss,
      conversionRateUsed: pair.quote === "JPY" ? null : quoteToJpy,
      settings: input.settings,
    },
  };
}

/**
 * 逆算モード：ロット数から最大損切り幅を計算する。
 *
 * 最大損切り幅（pips）= 許容損失額 ÷（ロット数 × 1ロットあたりの 1pips 損益）
 * 結果は 0.1pips 単位で切り捨てる。
 */
export function calculateReverse(
  input: ReverseInput,
): CalcOutcome<ReverseResult> {
  const { errors, pair } = validateReverseInput(input);
  if (errors.length > 0 || !pair) {
    return { ok: false, errors };
  }

  const balance = input.balance as number;
  const riskPercent = input.riskPercent as number;
  const lots = input.lots as number;
  const entryPrice = input.entryPrice;

  const quoteToJpy = resolveQuoteToJpyRate(pair, input.rates, entryPrice);
  if (quoteToJpy === null) {
    return {
      ok: false,
      errors: [
        {
          field: "usdJpy",
          message: `${pair.label} は円換算が必要です。USD/JPY のレートを入力してください`,
        },
      ],
    };
  }

  const allowedLoss = calcAllowedLoss(balance, riskPercent);
  const pipValuePerLot = calcPipValuePerLot(
    pair,
    input.settings.lotSize,
    quoteToJpy,
  );
  const pipValueAtLots = lots * pipValuePerLot;
  const maxPips = floorPips(allowedLoss / pipValueAtLots);
  const maxLoss = floorYen(maxPips * pipValueAtLots);

  const priceOffset = entryPrice !== null ? pipsToPrice(pair, maxPips) : null;
  const factor = 10 ** pair.priceDecimals;
  const roundPrice = (v: number) => Math.round(v * factor) / factor;

  return {
    ok: true,
    value: {
      pair,
      balance,
      riskPercent,
      allowedLoss,
      lots,
      pipValuePerLot,
      pipValueAtLots,
      maxPips,
      maxLoss,
      entryPrice,
      stopPriceLong:
        entryPrice !== null && priceOffset !== null
          ? roundPrice(entryPrice - priceOffset)
          : null,
      stopPriceShort:
        entryPrice !== null && priceOffset !== null
          ? roundPrice(entryPrice + priceOffset)
          : null,
      conversionRateUsed: pair.quote === "JPY" ? null : quoteToJpy,
      settings: input.settings,
    },
  };
}
