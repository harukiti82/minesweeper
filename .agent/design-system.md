# デザインシステム（ダークモード）

「ダークモードで映える」を実現する配色トークン。Tailwind の組み込みカラーで完結させる（カスタム CSS 変数は使わない）。

## ベース配色

| 用途 | Tailwind クラス | 用途例 |
|---|---|---|
| ページ背景 | `bg-zinc-950` | `<html>` `<body>` ルート |
| カード／パネル背景 | `bg-zinc-900` | StatusBar、設定パネル |
| ボーダー（弱） | `border-zinc-800` | カード枠 |
| ボーダー（強） | `border-zinc-700` | セル枠、フォーカス |
| テキスト主 | `text-zinc-100` | 見出し、数字 |
| テキスト副 | `text-zinc-400` | ラベル、補助情報 |
| ホバー | `hover:bg-zinc-700` | 未開封セル hover |
| アクセント | `bg-indigo-500 hover:bg-indigo-400` | リスタートボタン、勝利オーバーレイ |

## セルの状態別スタイル

| 状態 | クラス（抜粋） |
|---|---|
| 未開封 | `bg-zinc-800 border border-zinc-700 hover:bg-zinc-700` |
| 開封・空 | `bg-zinc-900 border border-zinc-800` |
| 開封・数字 | `bg-zinc-900 border border-zinc-800 font-bold` + 数字色（下記） |
| 旗付き | `bg-zinc-800 border border-amber-500/40` + Flag アイコン `text-amber-400` |
| 地雷（敗北時） | `bg-rose-900/40 border border-rose-700` + Bomb アイコン `text-rose-400` |
| 地雷（踏んだ瞬間） | 上記 + `ring-2 ring-rose-500 animate-pulse` |

セルサイズ: `w-8 h-8`（Easy/Medium）、`w-7 h-7`（Hard、画面に収めるため）

## 数字色（隣接地雷数）

| 数 | クラス |
|---|---|
| 1 | `text-sky-400` |
| 2 | `text-emerald-400` |
| 3 | `text-rose-400` |
| 4 | `text-violet-400` |
| 5 | `text-amber-400` |
| 6 | `text-cyan-300` |
| 7 | `text-pink-300` |
| 8 | `text-zinc-300` |

`0` は空欄として何も描画しない。

## レイアウト

```
┌──────────────────────────────────────┐
│  bg-zinc-950 (全画面)                │
│  ┌────────────────────────────────┐  │
│  │  DifficultySelector            │  │
│  │  (タブ風: easy/medium/hard)    │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  StatusBar                     │  │
│  │  [💣 残:7]  [⏱ 42s]  [↻]      │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  Board (CSS Grid)              │  │
│  │  ▢▢▢▢▢▢▢▢▢                    │  │
│  │  ▢▢▢▢▢▢▢▢▢                    │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

- 全体を `min-h-screen flex flex-col items-center justify-start pt-12 gap-4`
- 各パネルは `rounded-lg p-4` + 影 `shadow-lg shadow-black/40`

## オーバーレイ（勝敗時）

- 背景: `bg-zinc-950/80 backdrop-blur-sm`（半透明）
- 中央カード: `bg-zinc-900 border border-zinc-700 rounded-xl p-8`
- 勝利: 見出し `text-indigo-400 text-3xl font-bold "Clear!"`、グロウ `shadow-[0_0_40px_rgba(99,102,241,0.4)]`
- 敗北: 見出し `text-rose-400 text-3xl font-bold "Game Over"`

## アニメーション方針

- 開封時のフェード: `transition-colors duration-150`
- 地雷ヒット時の赤フラッシュ: `animate-pulse`（短時間 ~500ms で解除）
- 勝利時の indigo グロウ: 上記 box-shadow を transition で

過剰な動きは入れない。**ダークモードの落ち着いた雰囲気を壊さない**ことを優先する。

## フォント

- Tailwind デフォルト（system-ui）を使う。Web フォント追加禁止（読み込み待ちで FOIT/FOUT が出るのを避けるため）
- 数字は `font-bold tabular-nums`（タイマー含む）
