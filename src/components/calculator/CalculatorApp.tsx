"use client";

import { useCallback, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { StepHeading } from "@/components/ui/StepHeading";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
  type CalculatorFormState,
  DEFAULT_FORM_STATE,
  resolveRiskPercent,
  sanitizeFormState,
  toForwardInput,
  toReverseInput,
} from "@/lib/form/formState";
import { calculateForward, calculateReverse } from "@/lib/fx/calculator";
import { findPair } from "@/lib/fx/currencyPairs";
import { parseNumber } from "@/lib/fx/format";
import { calcAllowedLoss } from "@/lib/fx/risk";
import type { CalcError, FieldName } from "@/lib/fx/types";
import { createPersistentStore } from "@/lib/storage/persistentStore";
import { AppHeader } from "./AppHeader";
import { BalanceInput } from "./BalanceInput";
import { Disclaimer } from "./Disclaimer";
import { ErrorList } from "./ErrorList";
import { ForwardResultCard } from "./ForwardResultCard";
import { LotInput } from "./LotInput";
import { ModeSwitch } from "./ModeSwitch";
import { PairSelector } from "./PairSelector";
import { PriceInputs } from "./PriceInputs";
import { ResultActions } from "./ResultActions";
import { ReverseResultCard } from "./ReverseResultCard";
import { RiskSelector } from "./RiskSelector";
import { TradeSettingsPanel } from "./TradeSettingsPanel";

export const FORM_STORAGE_KEY = "fx-lot-calculator:form:v1";

/** 直前の入力内容をブラウザに保存するストア */
const formStore = createPersistentStore<CalculatorFormState>(
  FORM_STORAGE_KEY,
  DEFAULT_FORM_STATE,
  sanitizeFormState,
);

/** 何か 1 つでも入力されているか（未入力時のエラー表示を抑えるため） */
function isPristine(form: CalculatorFormState): boolean {
  return (
    form.balance === "" &&
    form.entryPrice === "" &&
    form.stopPrice === "" &&
    form.lots === "" &&
    form.usdJpy === "" &&
    (form.riskMode === "preset" || form.riskCustom === "")
  );
}

export function CalculatorApp() {
  const [form, setForm] = usePersistentState(formStore);
  const [touched, setTouched] = useState<Set<FieldName>>(() => new Set());

  const patch = useCallback(
    (p: Partial<CalculatorFormState>) => setForm((prev) => ({ ...prev, ...p })),
    [setForm],
  );
  const touch = useCallback(
    (field: FieldName) => () =>
      setTouched((prev) => (prev.has(field) ? prev : new Set(prev).add(field))),
    [],
  );

  const reset = useCallback(() => {
    setForm((prev) => ({
      ...DEFAULT_FORM_STATE,
      mode: prev.mode,
      settings: prev.settings,
    }));
    setTouched(new Set());
  }, [setForm]);

  // ---- 計算（入力のたびにリアルタイム） ----
  const riskPercent = resolveRiskPercent(form);
  const balance = parseNumber(form.balance);
  const allowedLoss =
    balance !== null && balance > 0 && riskPercent !== null && riskPercent > 0
      ? calcAllowedLoss(balance, riskPercent)
      : null;

  const forwardOutcome = useMemo(
    () => (form.mode === "forward" ? calculateForward(toForwardInput(form)) : null),
    [form],
  );
  const reverseOutcome = useMemo(
    () => (form.mode === "reverse" ? calculateReverse(toReverseInput(form)) : null),
    [form],
  );
  const outcome = forwardOutcome ?? reverseOutcome;

  const errors: CalcError[] = outcome && !outcome.ok ? outcome.errors : [];
  const pristine = isPristine(form);

  /** 入力済み or 一度触った欄だけ赤枠にする */
  const isInvalid = (field: FieldName, value: string) =>
    !pristine &&
    errors.some((e) => e.field === field) &&
    (value !== "" || touched.has(field));

  const pair = findPair(form.pairId);
  const reverseEntryRequired =
    pair !== undefined && pair.quote !== "JPY" && pair.base === "USD";

  const resultStep = 6;

  return (
    <main className="mx-auto w-full max-w-md px-4 pt-6">
      <AppHeader />

      <div className="mb-4">
        <ModeSwitch value={form.mode} onChange={(mode) => patch({ mode })} />
      </div>

      <div className="space-y-3">
        <BalanceInput
          step={1}
          value={form.balance}
          onChange={(balance) => patch({ balance })}
          onBlur={touch("balance")}
          invalid={isInvalid("balance", form.balance)}
        />

        <RiskSelector
          step={2}
          riskMode={form.riskMode}
          riskPreset={form.riskPreset}
          riskCustom={form.riskCustom}
          riskPercent={riskPercent}
          allowedLoss={allowedLoss}
          onChange={patch}
          onBlur={touch("riskPercent")}
          invalid={isInvalid("riskPercent", form.riskCustom)}
        />

        <PairSelector
          step={3}
          pairId={form.pairId}
          usdJpy={form.usdJpy}
          onPairChange={(pairId) => patch({ pairId })}
          onUsdJpyChange={(usdJpy) => patch({ usdJpy })}
          onUsdJpyBlur={touch("usdJpy")}
          usdJpyInvalid={isInvalid("usdJpy", form.usdJpy)}
        />

        {form.mode === "forward" ? (
          <PriceInputs
            entryStep={4}
            stopStep={5}
            pairId={form.pairId}
            entryPrice={form.entryPrice}
            stopPrice={form.stopPrice}
            onEntryChange={(entryPrice) => patch({ entryPrice })}
            onStopChange={(stopPrice) => patch({ stopPrice })}
            onEntryBlur={touch("entryPrice")}
            onStopBlur={touch("stopPrice")}
            entryInvalid={isInvalid("entryPrice", form.entryPrice)}
            stopInvalid={isInvalid("stopPrice", form.stopPrice)}
          />
        ) : (
          <LotInput
            lotStep={4}
            entryStep={5}
            pairId={form.pairId}
            lots={form.lots}
            entryPrice={form.entryPrice}
            entryRequired={reverseEntryRequired}
            onLotsChange={(lots) => patch({ lots })}
            onEntryChange={(entryPrice) => patch({ entryPrice })}
            onLotsBlur={touch("lots")}
            onEntryBlur={touch("entryPrice")}
            lotsInvalid={isInvalid("lots", form.lots)}
            entryInvalid={isInvalid("entryPrice", form.entryPrice)}
          />
        )}

        <TradeSettingsPanel
          settings={form.settings}
          onChange={(settings) => patch({ settings })}
        />

        {forwardOutcome?.ok ? (
          <ForwardResultCard step={resultStep} result={forwardOutcome.value} onReset={reset} />
        ) : reverseOutcome?.ok ? (
          <ReverseResultCard step={resultStep} result={reverseOutcome.value} onReset={reset} />
        ) : (
          <Card className="border-dashed">
            <StepHeading step={resultStep} title="結果" />
            <ErrorList errors={errors} pristine={pristine} />
            <div className="mt-4">
              <ResultActions copyText={null} onReset={reset} />
            </div>
          </Card>
        )}
      </div>

      <Disclaimer />
    </main>
  );
}
