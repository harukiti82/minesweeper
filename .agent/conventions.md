# 規約（命名・コード・テスト）

## 命名規則

| 対象 | 規則 | 例 |
|---|---|---|
| ファイル | コンポーネントは `PascalCase.tsx`、それ以外は `kebab-case.ts` | `Cell.tsx`, `use-game.ts` ❌ → `useGame.ts` ✅（フック例外） |
| 関数 | camelCase | `createBoard`, `revealCell` |
| 型 / Interface | PascalCase | `GameState`, `Cell` |
| 定数 | SCREAMING_SNAKE_CASE | `DIFFICULTY_CONFIGS` |
| React コンポーネント | PascalCase | `Board`, `StatusBar` |
| カスタムフック | `use` プレフィックス + camelCase | `useGame` |

**フックファイル名の例外**: `useGame.ts`（camelCase の `use` プレフィックス）。`use-game.ts` にしない。

禁止:
- 省略形 `usr`, `mgr`, `btn` などはコード内で使わない（`button`, `manager` と書く）
- `any` 型の使用（`unknown` を使い、必要なら型ガード）
- `// @ts-ignore` の使用（`// @ts-expect-error` + 理由コメントなら可、ただし極力避ける）

## コードスタイル

- **早期 return を好む**。ネスト深いら早期 return でフラット化
- **三項演算子のネスト禁止**（2段以上はやらない）。`if/else` か `switch` で
- **`switch` の `default` 必須**（網羅性チェック）
- **マジックナンバー禁止**: 数字リテラルは定数化（盤面サイズは `DIFFICULTY_CONFIGS` を使う）
- **`structuredClone`** で Board を deep copy（JSON.parse(JSON.stringify(...)) は使わない）

## エラーハンドリング

このプロジェクトはユーザー入力が限定的（クリック・難易度選択）なので、
**throw で落とすのはバグ検出時のみ**。通常の操作で例外は出さない。

- `createBoard` で地雷数が盤面に対して過大な場合: `throw new Error('Invalid difficulty config')`
- それ以外: 不正操作は `state` をそのまま返す（何もしない）

## React の書き方

- 関数コンポーネントのみ（クラス不使用）
- `props` 型は `Props` 型エイリアスを定義して使う（インラインの `{ ... }` 直書き禁止）
  ```tsx
  type Props = { cell: Cell; onReveal: () => void };
  export function Cell({ cell, onReveal }: Props) { ... }
  ```
- `memo` は使わない（小規模で不要、計測してから必要なら入れる）
- `key` は安定した識別子（`${row}-${col}`）を使う

## テストポリシー

- **対象**: `src/lib/` のみ
- **不対象**: `components/`, `hooks/`, `App.tsx`（UI テストは費用対効果が低いため）
- **カバレッジ目標**: lib に対して 80% 以上
- テストファイル: `tests/{module}.test.ts`（`tests/game.test.ts` など）
- アサーション: `expect(actual).toBe(expected)` または `toEqual` を使う

## Tailwind の使い方

- インラインで `className` に直接書く（外部 CSS ファイルは作らない、index.css のみ）
- 長くなったら `clsx` でなく**テンプレートリテラル + 条件演算子**で済ませる
  ```tsx
  className={`base ${condition ? 'on' : 'off'}`}
  ```
- 4 条件以上の分岐になるなら `clsx` を導入してよい（その時点で追加）

## ファイル長の目安

- 1 ファイル 200 行を超えたら分割を検討
- `src/lib/game.ts` は例外（ロジック集約のため 300 行までOK）
