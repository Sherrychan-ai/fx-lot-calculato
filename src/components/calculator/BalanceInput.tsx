"use client";

import { Card } from "@/components/ui/Card";
import { StepHeading } from "@/components/ui/StepHeading";
import { TextField } from "@/components/ui/TextField";
import { formatWithCommas, sanitizeIntegerInput } from "@/lib/fx/format";

interface BalanceInputProps {
  step: number;
  value: string;
  onChange: (digits: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
}

export function BalanceInput({ step, value, onChange, onBlur, invalid }: BalanceInputProps) {
  return (
    <Card>
      <StepHeading step={step} title="資金" hint="口座にある金額" htmlFor="balance" />
      <TextField
        id="balance"
        inputMode="numeric"
        autoComplete="off"
        placeholder="1,000,000"
        suffix="円"
        value={formatWithCommas(value)}
        onChange={(v) => onChange(sanitizeIntegerInput(v))}
        onBlur={onBlur}
        invalid={invalid}
      />
    </Card>
  );
}
