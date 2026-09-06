"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { CalculatorMode } from "@/lib/fx/types";

const MODE_OPTIONS: readonly { value: CalculatorMode; label: string }[] = [
  { value: "forward", label: "損切り幅からロットを計算" },
  { value: "reverse", label: "ロット数から損切り幅を逆算" },
];

interface ModeSwitchProps {
  value: CalculatorMode;
  onChange: (mode: CalculatorMode) => void;
}

export function ModeSwitch({ value, onChange }: ModeSwitchProps) {
  return (
    <SegmentedControl
      aria-label="計算モード"
      value={value}
      options={MODE_OPTIONS}
      onChange={onChange}
      size="sm"
    />
  );
}
