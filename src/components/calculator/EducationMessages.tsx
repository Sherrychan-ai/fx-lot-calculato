import { Notice } from "@/components/ui/Notice";

interface EducationMessagesProps {
  mode: "forward" | "reverse";
}

/** 初心者向けの教育メッセージ */
export function EducationMessages({ mode }: EducationMessagesProps) {
  return (
    <div className="space-y-2">
      <Notice tone="success">
        {mode === "forward"
          ? "このロット数以下でエントリーすれば、設定した損失率以内に収まる計算です。"
          : "損切り幅をこの pips 以内にすれば、設定した損失率以内に収まる計算です。"}
      </Notice>
      <Notice tone="info">
        <span aria-hidden="true">💡 </span>
        利益ではなく、まず損失を決めてからロットを決める習慣をつけましょう。
      </Notice>
    </div>
  );
}
