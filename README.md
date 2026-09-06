# FX ロット・損切り計算機

FX スクールの生徒向けの、**「損失を先に決めてからロットを決める」** ためのシンプルな Web アプリです。
口座資金・許容損失率・通貨ペア・エントリー価格・損切り価格を入力すると、適正ロット数を自動計算します。
スマホでの利用を前提にしており、ダークモードにも対応しています。

- 技術スタック：Next.js（App Router）/ TypeScript / Tailwind CSS v4 / Vitest
- 計算ロジックは UI から完全に分離し、ユニットテストで検証済み

---

## 1. ファイル構成

```
.
├── src/
│   ├── app/
│   │   ├── layout.tsx            # ルートレイアウト（メタ情報・ダークモード初期化スクリプト）
│   │   ├── page.tsx              # トップページ（CalculatorApp を表示）
│   │   └── globals.css           # Tailwind 読み込み・ダークモード variant・基本スタイル
│   │
│   ├── lib/                      # ★ UI から独立した純粋ロジック
│   │   ├── fx/
│   │   │   ├── types.ts          # ドメイン型（CurrencyPair, ForwardInput, ForwardResult など）
│   │   │   ├── currencyPairs.ts  # 通貨ペア定義（配列に追加するだけで拡張可能）
│   │   │   ├── pips.ts           # pips 計算・売買方向判定
│   │   │   ├── conversion.ts     # 円換算レートの解決・1ロットあたり pips 価値
│   │   │   ├── risk.ts           # 許容損失額・リスクレベル判定
│   │   │   ├── rounding.ts       # ロット切り捨て・pips 切り捨て
│   │   │   ├── validation.ts     # 初心者向けエラーメッセージ付きの入力検証
│   │   │   ├── calculator.ts     # 通常モード / 逆算モードの計算本体
│   │   │   ├── format.ts         # 表示用フォーマット・入力文字列のサニタイズ
│   │   │   ├── copyText.ts       # 結果コピー用テキスト生成
│   │   │   ├── index.ts          # まとめて export
│   │   │   └── __tests__/        # ユニットテスト
│   │   ├── form/
│   │   │   ├── formState.ts      # 画面入力の状態型・初期値・数値変換・保存データの復元
│   │   │   └── __tests__/
│   │   └── storage/
│   │       ├── persistentStore.ts # localStorage 保存用の外部ストア
│   │       └── __tests__/
│   │
│   ├── hooks/
│   │   ├── usePersistentState.ts # ストアを React から購読する（useSyncExternalStore）
│   │   ├── useTheme.ts           # ダークモード切り替え
│   │   └── useCopyToClipboard.ts # クリップボードコピー
│   │
│   └── components/
│       ├── ui/                   # 汎用 UI 部品
│       │   ├── Card.tsx
│       │   ├── StepHeading.tsx   # 「1 資金」のような番号付き見出し
│       │   ├── TextField.tsx
│       │   ├── SelectField.tsx
│       │   ├── SegmentedControl.tsx
│       │   ├── Button.tsx
│       │   └── Notice.tsx
│       └── calculator/           # 計算機固有のコンポーネント
│           ├── CalculatorApp.tsx # 状態管理と全体の組み立て
│           ├── AppHeader.tsx     # タイトル・説明文・ダークモードボタン
│           ├── ModeSwitch.tsx    # 通常モード / 逆算モード切り替え
│           ├── BalanceInput.tsx  # 1. 資金
│           ├── RiskSelector.tsx  # 2. リスク（プリセット + 自由入力、許容損失額、警告）
│           ├── PairSelector.tsx  # 3. 通貨ペア（換算レート入力を含む）
│           ├── PriceInputs.tsx   # 4. エントリー / 5. 損切り（損切り幅をリアルタイム表示）
│           ├── LotInput.tsx      # 逆算モード用：ロット数 / エントリー（任意）
│           ├── TradeSettingsPanel.tsx # 1ロットの通貨数量・発注単位
│           ├── ForwardResultCard.tsx  # 6. 結果（通常モード）
│           ├── ReverseResultCard.tsx  # 6. 結果（逆算モード）
│           ├── StatItem.tsx
│           ├── EducationMessages.tsx  # 初心者向けメッセージ
│           ├── ErrorList.tsx          # エラー一覧
│           ├── ResultActions.tsx      # コピー / リセット
│           └── Disclaimer.tsx         # 免責表示
├── vitest.config.mts
├── package.json
└── README.md
```

## 2. 主な機能

| 機能 | 内容 |
| --- | --- |
| 通常モード | 損切り幅から適正ロット数を計算 |
| 逆算モード | ロット数から最大損切り幅（pips）を計算。エントリー価格を入れると買い / 売りそれぞれの損切り価格の目安も表示 |
| 許容損失率 | 0.5% / 1% / 1.5% / 2% / 3% のプリセット + 自由入力（初期値 1%） |
| 許容損失額の即時表示 | 「今回許容できる損失額：10,000円」 |
| 通貨ペア | USD/JPY, EUR/JPY, GBP/JPY, AUD/JPY, NZD/JPY, EUR/USD, GBP/USD, AUD/USD, USD/CHF, USD/CAD |
| 円換算 | クロス円は自動、それ以外は USD/JPY レートを入力（「この通貨ペアは円換算レートが必要です」を表示） |
| 損切り幅のリアルタイム表示 | 「損切り幅：50.0 pips」＋ 買い / 売りの判定 |
| ロット単位設定 | 1ロット = 1,000 / 10,000 / 100,000 通貨（初期値 10,000） |
| 発注単位 | 0.01 / 0.1 / 1 LOT（初期値 0.01）。**必ず切り捨て** |
| リスク警告 | 2% 超で「リスクが高めです」、3% 以上で強い警告（トレードは禁止しない） |
| 便利機能 | リアルタイム計算・リセット・入力内容のブラウザ保存・スマホ対応・ダークモード・結果コピー |
| エラー処理 | 資金 0 以下 / 損失率 0 以下 / 価格が同じ / 未入力 / 換算レート未入力 を初心者向け文章で表示 |
| 免責表示 | 画面下部に表示 |

## 3. 計算ロジック

すべて `src/lib/fx/` にあり、UI に依存しません。

### pips の定義

- クォート通貨が JPY（USD/JPY, EUR/JPY など）：**1pips = 0.01**
- それ以外（EUR/USD, USD/CHF など）：**1pips = 0.0001**

```
損切り幅（pips）= |エントリー価格 − 損切り価格| ÷ pips の値幅
USD/JPY 147.350 → 146.850 : 0.500 ÷ 0.01   = 50.0 pips
EUR/USD 1.0850  → 1.0800  : 0.0050 ÷ 0.0001 = 50.0 pips
```

### 許容損失額

```
許容損失額 = 口座資金 × 許容損失率（円未満切り捨て）
1,000,000円 × 1% = 10,000円
```

### 1ロットあたりの 1pips 損益（円）

```
1pips 損益 = pips の値幅 × 1ロットの通貨数量 × （クォート通貨 → 円 のレート）
```

| 通貨ペアの種類 | クォート通貨 → 円 のレート |
| --- | --- |
| クロス円（USD/JPY など） | 1（換算不要） |
| USD クォート（EUR/USD など） | 入力した USD/JPY レート |
| USD ベース（USD/CHF, USD/CAD） | USD/JPY ÷ 通貨ペア価格（エントリー価格を使用） |

例：USD/JPY・1ロット = 10,000通貨 → 0.01 × 10,000 = **100円**
例：EUR/USD・1ロット = 10,000通貨・USD/JPY = 150 → 0.0001 × 10,000 × 150 = **150円**

### 適正ロット数（通常モード）

```
適正ロット数 = 許容損失額 ÷（損切り pips × 1ロットあたりの 1pips 損益）
            = 10,000 ÷（50 × 100）= 2.00 LOT
```

結果は発注単位で **切り捨て** ます（例：1.876 LOT・0.1 LOT 単位 → 1.8 LOT）。
そのため「損切りにかかった場合の損失」は常に許容損失額以下になります。

### 最大損切り幅（逆算モード）

```
最大損切り幅（pips）= 許容損失額 ÷（ロット数 × 1ロットあたりの 1pips 損益）
                   = 10,000 ÷（2 × 100）= 50.0 pips
```

0.1pips 単位で切り捨てます。

## 4. 起動方法

Node.js 22 以上を推奨します。

```bash
npm install
npm run dev
```

ブラウザで <http://localhost:3000> を開いてください。

本番ビルドで確認する場合：

```bash
npm run build
npm run start
```

### 公開（GitHub Pages）

公開 URL：<https://sherrychan-ai.github.io/fx-lot-calculato/>

`.github/workflows/deploy-pages.yml` が、`main` への push をきっかけに静的サイトを書き出して GitHub Pages に自動デプロイします。
`next.config.ts` で `output: "export"` を指定しているため、`npm run build` の結果（`out/`）はどの静的ホスティングにもそのまま置けます。
サブパス配下で公開する場合は `NEXT_PUBLIC_BASE_PATH=/リポジトリ名` を付けてビルドしてください。

## 5. テスト方法

```bash
npm run test        # ユニットテスト（Vitest）
npm run test:watch  # 変更を監視しながら実行
npm run typecheck   # TypeScript の型チェック
npm run lint        # ESLint
npm run check       # 上の 3 つをまとめて実行
```

テスト対象（`src/lib/**/__tests__/`）：

- USD/JPY・EUR/USD の pips 計算（`pips.test.ts`）
- 許容損失額・リスクレベル判定（`risk.test.ts`）
- ロットの切り捨て・浮動小数点誤差（`rounding.test.ts`）
- 円換算レートの解決・1pips 価値（`conversion.test.ts`）
- 通常モード / 逆算モードの計算と、0・未入力・NaN などのエラー処理（`calculator.test.ts`）
- 表示フォーマット・結果コピー形式（`format.test.ts`）
- 画面状態の変換と保存データの復元（`formState.test.ts`）
- localStorage ストア（`persistentStore.test.ts`）

## 6. 今後拡張しやすいポイント

将来予定されている機能に対して、どこを触ればよいかの目安です。

| 予定機能 | 変更箇所の目安 |
| --- | --- |
| 通貨ペア追加 | `lib/fx/currencyPairs.ts` の配列に `definePair(...)` を追加。JPY / USD 以外がクォート通貨で USD がベースでもないペア（EUR/GBP など）は `lib/fx/conversion.ts` の `resolveQuoteToJpyRate` に換算ルールを追加 |
| 利確価格入力 | `lib/form/formState.ts` に `takeProfitPrice` を追加 → `lib/fx/types.ts` の `ForwardInput` に渡す → `PriceInputs.tsx` に入力欄を追加 |
| リスクリワード計算・期待利益 | `lib/fx/` に `reward.ts` を追加し、`calculateForward` の結果に `rewardPips` / `riskReward` / `expectedProfit` を足す。表示は `ForwardResultCard.tsx` に `StatItem` を追加 |
| トレード日誌 | `ForwardResult` / `ReverseResult` をそのまま 1 件の記録として保存できる。`lib/storage/createPersistentStore` で `journal` ストアを作れば即座にローカル保存可能 |
| AI トレード分析 | `buildForwardCopyText` と同様に、`ForwardResult` から分析用のプロンプトを生成する関数を `lib/` に追加 |
| スクール生ログイン・生徒別履歴・講師用管理画面 | `PersistentStore` と同じインターフェース（`subscribe / getSnapshot / set`）でサーバー API 版のストアを実装すれば、UI を変えずに保存先を切り替えられる。Next.js の App Router なので `app/api/` や `app/(admin)/` を追加しやすい |

設計上のポイント：

- **ロジックと UI の分離**：`lib/` は React に依存しないため、テストしやすく、別の UI（LINE Bot など）からも再利用できます
- **文字列で保持する入力状態**：入力途中の値を壊さないため、画面の状態は文字列で持ち、計算時に数値へ変換します（`toForwardInput` / `toReverseInput`）
- **安全な復元**：`sanitizeFormState` が古い形式や壊れた保存データを初期値で補うため、フィールド追加時に古いデータで落ちません
- **結果型がそのまま記録になる**：`ForwardResult` / `ReverseResult` は入力値と計算値を両方含むため、履歴保存や分析にそのまま使えます

## 免責

本ツールの計算結果は参考値です。実際の損益は、FX会社の取引条件、スプレッド、スリッページ、為替レート等によって異なる場合があります。本ツールは特定の取引を推奨するものではありません。
