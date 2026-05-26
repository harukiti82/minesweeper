# Minesweeper — エージェント向けガイド

ダークモードで映える Web 版マインスイーパー。React + Vite + TypeScript + Tailwind。実装は Claude Sonnet が `.agent/` の仕様に従って進める。

> このリポジトリの AI 向け規約はここに集約してある。詳細仕様は `.agent/` を参照。
> ユーザー向けの説明は README.md にある（`docs/` は当面作らない）。

## 概要

- 目的: ブラウザで遊べる、ダークモードで視認性の高いマインスイーパー
- 対象: ローカルで遊ぶユーザー（自分用）
- 状況: α（Phase 0 = 足場のみ。実装は Phase 1 から Sonnet が着手）

## 実装担当方針

**実装は Claude Sonnet が行う前提**で仕様書を書いてある。Sonnet は行間を読まずに
リテラルに従うため、以下を厳守して書く：

- 型定義は `.agent/types.md` に**完全な TypeScript コード**で書く（曖昧な日本語仕様にしない）
- 各タスクには**受け入れ条件（何をもって完了とするか）**を明記する
- 「いい感じに」「適切に」のような表現は使わない。具体的な値を書く
- 参照すべきファイルは「Read すべきファイル」として明示する

## 技術スタック

| 領域 | 採用 | 補足 |
|---|---|---|
| 言語 | TypeScript | 5.x、`strict: true` |
| ビルド | Vite | 5.x |
| UI | React | 18.x |
| スタイル | Tailwind CSS | 3.x、`darkMode: 'class'`、html に `dark` を常時付与 |
| 状態管理 | React `useReducer` | 外部ライブラリ追加禁止 |
| アイコン | lucide-react | mine/flag/clock のみ使う |
| テスト | Vitest | ゲームロジック（`src/lib/`）のみ対象、UI は対象外 |
| Format | Prettier（デフォルト設定） | ESLint は導入しない（小規模のため） |

## ディレクトリ規約

```
minesweeper/
├── src/
│   ├── components/   ← Reactコンポーネント（純粋表示寄り、ロジックは hooks/lib へ）
│   ├── hooks/        ← useGame など。コンポーネントに直接 useReducer を書かない
│   ├── lib/          ← 純粋関数のゲームロジック。React 依存禁止（テスト容易性のため）
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css     ← Tailwind ディレクティブ + CSS 変数
├── tests/            ← Vitest のテストファイル。lib/ の関数のみテスト
├── .agent/           ← AI 向け詳細仕様（このファイルから一部 @import）
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

各ディレクトリの置く/置かない：

- `src/lib/`: 純粋関数のみ。`React` import 禁止。`Date.now()` などの副作用も避ける（テスト容易性）
- `src/hooks/`: `useReducer` / `useEffect` を持つ。コンポーネントには `useState` も最小限に
- `src/components/`: 表示と入力ハンドリングのみ。ロジックを書かない（hooks/lib に委譲）
- `tests/`: lib のテストのみ。UI のテストは書かない

## コマンド

| 用途 | コマンド |
|---|---|
| dev | `npm run dev` |
| build | `npm run build` |
| typecheck | `npm run typecheck`（`tsc --noEmit`） |
| test | `npm test` |
| format | `npm run format`（`prettier --write .`） |

## AI 向け詳細仕様

実装中に都度参照する。**毎ターン全文ロードはしない**（@import せずバックティック参照）。
該当フェーズに着手する直前に Read で開く。

- フェーズ別タスクリスト（受け入れ条件付き）: `.agent/tasks.md`
- 型定義（完全な TS コード）: `.agent/types.md`
- ゲームロジック仕様: `.agent/game-logic.md`
- アーキテクチャ全体: `.agent/architecture.md`
- 命名・テスト規約: `.agent/conventions.md`
- ダークモード配色トークン: `.agent/design-system.md`

### 作業履歴メモ（毎ターン参照・更新）

- 現在の作業状況（毎ターン上書き）: @.agent/activeContext.md
- 完了タスクの時系列（毎ターン追記）: @.agent/progress.md
- フェーズ別タスクリスト: @.agent/tasks.md

セッション開始時に必ず 3 つを読み、応答終了前に `activeContext` は最新状態で**上書き**、
作業が一段落していれば `progress` の末尾に**1〜3 行で追記**する。
スキップ可能なターン（単発質問への回答、タイポ修正のみ）では更新しない。
詳細ルールはグローバル CLAUDE.md の「プロジェクト作業履歴メモ」節を参照。

## デザイン規約

ダークモード固定（Glass Pastel ではなく **zinc 基調の落ち着いた配色**）。詳細トークンは
`.agent/design-system.md` を Read すること。要約：

- 背景: `zinc-950`、カードBG: `zinc-900`
- 未開封セル: `zinc-800` + `zinc-700` ボーダー、hover で `zinc-700`
- アクセント: `indigo-500`（リスタートボタン・勝利オーバーレイ）
- 数字: 1=`sky-400`, 2=`emerald-400`, 3=`rose-400`, 4=`violet-400`, 5=`amber-400`, 6=`cyan-300`, 7=`pink-300`, 8=`zinc-300`

## コミット規約

グローバル CLAUDE.md（`~/.claude/CLAUDE.md`）の「Git コミット」節に従う。日本語、`[種別] 概要` 形式。
