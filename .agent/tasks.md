# タスクリスト（フェーズ別・受け入れ条件付き）

> Sonnet 実装前提。各タスクには **受け入れ条件（Definition of Done）** と **Read すべきファイル** を明記。
> 上から順に消化する。完了したらチェックを入れ、`progress.md` に 1〜3 行追記。

## Phase 0: 足場（Opus が手動で完了済み）

- [x] `minesweeper/` ディレクトリ作成、git init、GitHub に push
- [x] AGENTS.md / CLAUDE.md / .agent/*.md / README.md 配置

## Phase 1: ゲームロジック（純粋関数のみ）

**Read すべき**: `.agent/types.md`, `.agent/game-logic.md`, `.agent/architecture.md`, `.agent/conventions.md`

- [x] **1-1. Vite プロジェクト初期化**
  - `npm create vite@latest . -- --template react-ts` を実行（既存ファイルは保持される対話に注意）
  - `package.json` 内容を確認し、不要なデフォルトテンプレ（`src/App.css`、`src/assets/`、ロゴ画像など）を削除
  - 受け入れ条件: `npm install && npm run dev` で空ページが起動する

- [x] **1-2. Tailwind CSS 導入**
  - `npm i -D tailwindcss postcss autoprefixer`
  - `npx tailwindcss init -p`
  - `tailwind.config.js` の `content` を `['./index.html', './src/**/*.{ts,tsx}']` に、`darkMode: 'class'` を追加
  - `src/index.css` を Tailwind ディレクティブのみに置き換え
  - `index.html` の `<html>` に `class="dark"` を付与
  - 受け入れ条件: `<div className="bg-zinc-950 text-zinc-100">` が黒背景で表示される

- [x] **1-3. 追加依存導入**
  - `npm i lucide-react`
  - `npm i -D vitest prettier`
  - `package.json` の `scripts` に `typecheck`, `test`, `format` を追加（AGENTS.md のコマンド表どおり）

- [x] **1-4. 型定義ファイル作成**
  - `src/lib/types.ts` を `.agent/types.md` の TS コードどおりに作成
  - 受け入れ条件: `tsc --noEmit` が通る

- [x] **1-5. `createBoard` 関数実装**
  - `src/lib/game.ts` に `createBoard(difficulty, firstClickRow, firstClickCol)` を実装
  - 仕様: `.agent/game-logic.md` の「盤面生成」節どおり
  - 初手保護: 最初のクリックセルと周囲8マスには地雷を配置しない
  - 受け入れ条件: `tests/game.test.ts` で以下が通る
    - Easy 盤面で地雷数が 10 個
    - 初手クリック位置と周囲8マスに地雷がない（100回試行で常に成立）
    - 各セルの `adjacentMines` が周囲8マスの地雷数と一致

- [x] **1-6. `revealCell` 関数実装**
  - `src/lib/game.ts` に `revealCell(state, row, col): GameState` を実装
  - BFS で `adjacentMines === 0` のセルから連鎖開封
  - 旗が立っているセルは開かない
  - 受け入れ条件: テストで以下が通る
    - 周囲地雷数0のセルを開くと隣接する0セルが連鎖開封される
    - 地雷を開いたら `status: 'lost'` に遷移
    - 旗付きセルは開かない

- [x] **1-7. `toggleFlag` 関数実装**
  - `src/lib/game.ts` に `toggleFlag(state, row, col): GameState` を実装
  - 開封済みセルには旗を立てられない
  - 受け入れ条件: テストで未開封セルに旗トグル、開封済みに無効を確認

- [x] **1-8. 勝敗判定**
  - `checkWin(state)`: 全非地雷セルが `revealed` なら true
  - 受け入れ条件: テストでクリア状態と未クリア状態を区別

**Phase 1 完了条件**: `npm test` が全パス、`npm run typecheck` が通る。

## Phase 2: UI 実装

**Read すべき**: `.agent/design-system.md`, `.agent/architecture.md`, 既存の `src/lib/`

- [x] **2-1. `useGame` フック**
  - `src/hooks/useGame.ts` を `useReducer` で実装
  - アクション: `START`, `REVEAL`, `FLAG`, `RESTART`, `SET_DIFFICULTY`
  - タイマーは `useEffect` で 1 秒ごとに進める（初手後〜終局まで）
  - 受け入れ条件: 戻り値が `{ state: GameState, dispatch: (action) => void }`

- [x] **2-2. `Cell` コンポーネント**
  - `src/components/Cell.tsx`
  - props: `cell: Cell, onReveal: () => void, onFlag: () => void`
  - 状態別の見た目（`.agent/design-system.md` どおり）
  - 右クリックで旗（`onContextMenu` で `preventDefault`）
  - 受け入れ条件: 未開封・開封（数字/空）・旗・地雷の5パターンを表示分け

- [x] **2-3. `Board` コンポーネント**
  - `src/components/Board.tsx`
  - `grid` を CSS Grid で表示（列数は難易度に応じて変える）
  - 受け入れ条件: Easy/Medium/Hard で正しいセル数が表示される

- [x] **2-4. `StatusBar` コンポーネント**
  - `src/components/StatusBar.tsx`
  - 残地雷数（mines - flags）、経過秒、リスタートボタン
  - アイコンは lucide-react の `Bomb`, `Flag`, `Clock`, `RotateCcw`
  - 受け入れ条件: タイマーが進む、リスタートで盤面が再生成される

- [x] **2-5. `DifficultySelector` コンポーネント**
  - `src/components/DifficultySelector.tsx`
  - 3つのラジオボタンまたはタブ。選択で `SET_DIFFICULTY` を dispatch
  - 受け入れ条件: 切り替えで盤面サイズが変わる

- [x] **2-6. `App.tsx` で組み立て**
  - 縦並びレイアウト: DifficultySelector → StatusBar → Board
  - 全体を `bg-zinc-950` で囲む
  - 受け入れ条件: ブラウザで実際にゲームが遊べる

**Phase 2 完了条件**: `npm run dev` で開き、Easy 盤面で1ゲームクリアできる。

## Phase 3: 仕上げ

- [x] **3-1. 勝敗オーバーレイ**
  - 勝利時: indigo グロウ + 「Clear!」表示
  - 敗北時: 全地雷を表示 + 赤フラッシュ + 「Game Over」表示
  - 「もう一度」ボタンを置く

- [x] **3-2. キーボードショートカット**
  - R: リスタート
  - 1/2/3: 難易度切替

- [ ] **3-3. 長押し旗（モバイル対応・任意）**
  - 500ms 押下で旗トグル

- [x] **3-4. アニメーション**
  - 開封時 `transition-colors duration-150`
  - 地雷ヒット時 `animate-pulse`（赤）

**Phase 3 完了条件**: Hard までクリア体験が破綻しない。

## Phase 4: 任意

- [ ] README.md にスクリーンショット追加
- [ ] GitHub Pages デプロイ（任意）
