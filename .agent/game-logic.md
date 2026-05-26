# ゲームロジック仕様

`src/lib/game.ts` に純粋関数として実装する。**React 依存禁止**、**`Date.now()` 直接呼び出し禁止**（引数で受け取る）。

## エクスポートする関数（シグネチャ確定）

```ts
import type { Board, Cell, DifficultyKey, GameAction, GameState } from './types';

export function createInitialState(difficulty: DifficultyKey): GameState;

export function createBoard(
  difficulty: DifficultyKey,
  firstClickRow: number,
  firstClickCol: number
): Board;

export function revealCell(state: GameState, row: number, col: number, now: number): GameState;

export function toggleFlag(state: GameState, row: number, col: number): GameState;

export function checkWin(board: Board): boolean;

export function reducer(state: GameState, action: GameAction): GameState;
```

## 仕様詳細

### `createInitialState(difficulty)`

- 全マス未開封・地雷なし・旗0の空 `Board` を返す
- `status: 'idle'`、`startedAt: null`、`endedAt: null`、`flagsUsed: 0`、`isFirstClick: true`
- 盤面サイズは `DIFFICULTY_CONFIGS[difficulty]` から取る
- **地雷はまだ置かない**（初手クリックで `createBoard` が生成する）

### `createBoard(difficulty, firstClickRow, firstClickCol)`

1. `rows × cols` の空セル配列を作る
2. 「初手保護領域」= `(firstClickRow, firstClickCol)` とその周囲8マス（最大9マス）を計算
3. 保護領域外のセルからランダムに `mines` 個選び `isMine = true` をセット
   - Fisher-Yates シャッフルで `[全インデックス \ 保護領域]` を並べ替えて先頭 `mines` 個を採用
4. 全セルの `adjacentMines` を計算（周囲8マスの地雷数を数える）
5. 完成した `Board` を返す

**エッジケース**:
- 保護領域のサイズが盤面サイズに対して大きすぎて `mines` を置けない場合は理論上ないが、`if (cells.length - protected.length < mines) throw` でガード

### `revealCell(state, row, col, now)`

事前チェック（**この順で**判定し、最初に該当したらそのまま `state` を返す＝何もしない）:

1. `state.status` が `'won'` or `'lost'` なら何もしない
2. `state.board[row][col].isFlagged` が true なら何もしない
3. `state.board[row][col].isRevealed` が true なら何もしない

処理:

- `state.isFirstClick === true` の場合:
  - `createBoard(state.difficulty, row, col)` で盤面を生成して差し替え
  - `startedAt: now`、`status: 'playing'`、`isFirstClick: false`
- クリックしたセルが地雷:
  - そのセルだけでなく、**全地雷セルを `isRevealed: true` にする**
  - `status: 'lost'`、`endedAt: now`
- クリックしたセルが非地雷:
  - そのセルを `isRevealed: true`
  - `adjacentMines === 0` なら BFS で周囲8マスを再帰的に開封
    - 既開封・旗付き・地雷のセルは展開対象から除外
  - 開封後 `checkWin(board)` が true なら `status: 'won'`、`endedAt: now`

### `toggleFlag(state, row, col)`

事前チェック:
1. `state.status` が `'idle'` 以外で `'playing'` でないなら何もしない
2. `state.board[row][col].isRevealed` なら何もしない

処理:
- `isFlagged` をトグル
- `flagsUsed` を ±1（旗を立てたら +1、外したら -1）

### `checkWin(board)`

- 全セルを走査
- すべての非地雷セルが `isRevealed: true` なら true
- 地雷セルの状態は問わない（旗の有無は勝利条件に関係しない）

### `reducer(state, action)`

`useGame` フックから呼ばれる。各アクションを上記関数にディスパッチ：

| Action | 処理 |
|---|---|
| `START` | `createInitialState(action.difficulty)` を返す |
| `REVEAL` | `revealCell(state, action.row, action.col, action.now)` |
| `FLAG` | `toggleFlag(state, action.row, action.col)` |
| `RESTART` | `createInitialState(state.difficulty)` |
| `SET_DIFFICULTY` | `createInitialState(action.difficulty)` |
| `TICK` | `state` をそのまま返す（タイマー描画再計算のためのトリガー） |

## テスト要件（`tests/game.test.ts`）

最低限テストすべきケース：

1. **盤面生成**
   - Easy で地雷数 = 10
   - 初手保護: `createBoard('easy', 4, 4)` を 100 回実行し、`board[4][4]` と周囲8マスに地雷がないこと
   - `adjacentMines` の整合性: 全マスで「自分の周囲8マスの地雷数 = adjacentMines」が成立

2. **revealCell**
   - 初手は盤面生成を伴う（`isFirstClick: true` → `false`）
   - 周囲地雷0のセル開封で連鎖開封が起きる（手動で組んだ盤面で確認）
   - 旗付きセルは開けない
   - 地雷を踏むと status: 'lost'、全地雷が isRevealed: true
   - 勝利条件達成で status: 'won'

3. **toggleFlag**
   - 未開封セルは旗トグル可、開封済みは無効
   - 旗カウント `flagsUsed` が正しく増減

4. **checkWin**
   - 全非地雷セルが開封されたら true
   - 1個でも未開封の非地雷があれば false
