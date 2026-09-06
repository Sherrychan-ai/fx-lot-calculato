import { Notice } from "@/components/ui/Notice";
import type { CalcError } from "@/lib/fx/types";

interface ErrorListProps {
  errors: CalcError[];
  /** まだ何も入力していない場合は優しい案内だけ出す */
  pristine: boolean;
}

export function ErrorList({ errors, pristine }: ErrorListProps) {
  if (pristine) {
    return (
      <Notice tone="info">
        上から順番に入力すると、ここに適正ロット数が表示されます。
      </Notice>
    );
  }
  if (errors.length === 0) return null;
  return (
    <Notice tone="caution" role="status">
      <p className="mb-1 font-bold">あと少し！次の項目を確認してください</p>
      <ul className="list-disc space-y-0.5 pl-5">
        {errors.map((e) => (
          <li key={`${e.field}:${e.message}`}>{e.message}</li>
        ))}
      </ul>
    </Notice>
  );
}
