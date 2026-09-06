"use client";

import { Card } from "@/components/ui/Card";
import { StepHeading } from "@/components/ui/StepHeading";
import { TextField } from "@/components/ui/TextField";
import { findPair } from "@/lib/fx/currencyPairs";
import { sanitizeDecimalInput } from "@/lib/fx/format";

interface LotInputProps {
  lotStep: number;
  entryStep: number;
  pairId: string;
  lots: string;
  entryPrice: string;
  /** USD/CHF などで換算のためにエントリー価格が必須になる場合 true */
  entryRequired: boolean;
  onLotsChange: (v: string) => void;
  onEntryChange: (v: string) => void;
  onLotsBlur?: () => void;
  onEntryBlur?: () => void;
  lotsInvalid?: boolean;
  entryInvalid?: boolean;
}

export function LotInput({
  lotStep,
  entryStep,
  pairId,
  lots,
  entryPrice,
  entryRequired,
  onLotsChange,
  onEntryChange,
  onLotsBlur,
  onEntryBlur,
  lotsInvalid,
  entryInvalid,
}: LotInputProps) {
  const pair = findPair(pairId);
  const placeholderEntry = pair?.quote === "JPY" ? "147.350" : "1.08500";
  return (
    <>
      <Card>
        <StepHeading step={lotStep} title="ロット数" hint="エントリーしたいロット" htmlFor="lots" />
        <TextField
          id="lots"
          inputMode="decimal"
          autoComplete="off"
          placeholder="2.00"
          suffix="LOT"
          value={lots}
          onChange={(v) => onLotsChange(sanitizeDecimalInput(v))}
          onBlur={onLotsBlur}
          invalid={lotsInvalid}
        />
      </Card>
      <Card>
        <StepHeading
          step={entryStep}
          title="エントリー"
          hint={entryRequired ? "換算のため必須" : "任意：損切り価格の目安を出します"}
          htmlFor="entryPriceReverse"
        />
        <TextField
          id="entryPriceReverse"
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholderEntry}
          value={entryPrice}
          onChange={(v) => onEntryChange(sanitizeDecimalInput(v))}
          onBlur={onEntryBlur}
          invalid={entryInvalid}
        />
      </Card>
    </>
  );
}
