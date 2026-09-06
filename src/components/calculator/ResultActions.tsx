"use client";

import { Button } from "@/components/ui/Button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface ResultActionsProps {
  copyText: string | null;
  onReset: () => void;
}

export function ResultActions({ copyText, onReset }: ResultActionsProps) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant="primary"
        disabled={copyText === null}
        onClick={() => copyText !== null && copy(copyText)}
        aria-live="polite"
      >
        {copied ? "✓ コピーしました" : "結果をコピー"}
      </Button>
      <Button variant="secondary" onClick={onReset}>
        リセット
      </Button>
    </div>
  );
}
