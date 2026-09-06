import { findPair } from "./currencyPairs";
import { requiresConversionRate } from "./conversion";
import type {
  CalcError,
  CurrencyPair,
  ForwardInput,
  ReverseInput,
} from "./types";

function isPositive(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value > 0;
}

function validateCommon(
  input: Pick<ForwardInput, "balance" | "riskPercent" | "pairId">,
): { errors: CalcError[]; pair: CurrencyPair | undefined } {
  const errors: CalcError[] = [];

  if (input.balance === null) {
    errors.push({ field: "balance", message: "口座資金を入力してください" });
  } else if (!isPositive(input.balance)) {
    errors.push({
      field: "balance",
      message: "口座資金は 0 より大きい金額を入力してください",
    });
  }

  if (input.riskPercent === null) {
    errors.push({
      field: "riskPercent",
      message: "許容損失率を入力してください",
    });
  } else if (!isPositive(input.riskPercent)) {
    errors.push({
      field: "riskPercent",
      message: "許容損失率は 0% より大きい値を入力してください",
    });
  } else if (input.riskPercent > 100) {
    errors.push({
      field: "riskPercent",
      message: "許容損失率は 100% 以下で入力してください",
    });
  }

  const pair = findPair(input.pairId);
  if (!pair) {
    errors.push({ field: "pairId", message: "通貨ペアを選択してください" });
  }

  return { errors, pair };
}

function validateUsdJpy(
  pair: CurrencyPair,
  usdJpy: number | null | undefined,
  errors: CalcError[],
) {
  if (!requiresConversionRate(pair)) return;
  if (usdJpy === null || usdJpy === undefined) {
    errors.push({
      field: "usdJpy",
      message: `${pair.label} は円換算が必要です。USD/JPY のレートを入力してください`,
    });
  } else if (!isPositive(usdJpy)) {
    errors.push({
      field: "usdJpy",
      message: "USD/JPY のレートは 0 より大きい値を入力してください",
    });
  }
}

export function validateForwardInput(input: ForwardInput): {
  errors: CalcError[];
  pair: CurrencyPair | undefined;
} {
  const { errors, pair } = validateCommon(input);

  if (input.entryPrice === null) {
    errors.push({
      field: "entryPrice",
      message: "エントリー価格を入力してください",
    });
  } else if (!isPositive(input.entryPrice)) {
    errors.push({
      field: "entryPrice",
      message: "エントリー価格は 0 より大きい値を入力してください",
    });
  }

  if (input.stopPrice === null) {
    errors.push({ field: "stopPrice", message: "損切り価格を入力してください" });
  } else if (!isPositive(input.stopPrice)) {
    errors.push({
      field: "stopPrice",
      message: "損切り価格は 0 より大きい値を入力してください",
    });
  } else if (
    isPositive(input.entryPrice) &&
    input.entryPrice === input.stopPrice
  ) {
    errors.push({
      field: "stopPrice",
      message:
        "エントリー価格と損切り価格が同じです。損切り価格はエントリー価格と違う値にしてください",
    });
  }

  if (pair) validateUsdJpy(pair, input.rates.usdJpy, errors);

  return { errors, pair };
}

export function validateReverseInput(input: ReverseInput): {
  errors: CalcError[];
  pair: CurrencyPair | undefined;
} {
  const { errors, pair } = validateCommon(input);

  if (input.lots === null) {
    errors.push({ field: "lots", message: "ロット数を入力してください" });
  } else if (!isPositive(input.lots)) {
    errors.push({
      field: "lots",
      message: "ロット数は 0 より大きい値を入力してください",
    });
  }

  if (input.entryPrice !== null && !isPositive(input.entryPrice)) {
    errors.push({
      field: "entryPrice",
      message: "エントリー価格は 0 より大きい値を入力してください",
    });
  }

  if (pair) {
    validateUsdJpy(pair, input.rates.usdJpy, errors);
    // USD/CHF などは換算に通貨ペア価格が必要
    if (pair.quote !== "JPY" && pair.base === "USD" && input.entryPrice === null) {
      errors.push({
        field: "entryPrice",
        message: `${pair.label} の円換算には価格が必要です。エントリー価格（現在の ${pair.label} レート）を入力してください`,
      });
    }
  }

  return { errors, pair };
}
