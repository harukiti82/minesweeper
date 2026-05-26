# 型定義

Sonnet はこのファイルの TypeScript コードを `src/lib/types.ts` にそのままコピーすること。
**型の追加・削除・リネームを勝手にしない**。仕様変更が必要ならユーザーに確認する。

## `src/lib/types.ts`（完全版）

```ts
// 難易度プリセット
export type DifficultyKey = 'easy' | 'medium' | 'hard';

export type DifficultyConfig = {
  rows: number;
  cols: number;
  mines: number;
};

export const DIFFICULTY_CONFIGS: Record<DifficultyKey, DifficultyConfig> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

// セル
export type Cell = {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number; // 0〜8。isMine が true でも計算しておく（敗北時に他のセルを再計算しないため）
};

// 盤面（2次元配列）
export type Board = Cell[][]; // board[row][col]

// ゲーム全体の状態
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export type GameState = {
  difficulty: DifficultyKey;
  board: Board;
  status: GameStatus;
  startedAt: number | null;   // 初手クリック時刻（ms）。idle のうちは null
  endedAt: number | null;     // 勝敗確定時刻（ms）
  flagsUsed: number;          // 現在立っている旗の数
  isFirstClick: boolean;      // 次のクリックが初手かどうか（盤面生成のトリガー）
};

// useReducer のアクション
export type GameAction =
  | { type: 'START'; difficulty: DifficultyKey }
  | { type: 'REVEAL'; row: number; col: number; now: number }
  | { type: 'FLAG'; row: number; col: number }
  | { type: 'RESTART' }
  | { type: 'SET_DIFFICULTY'; difficulty: DifficultyKey }
  | { type: 'TICK' }; // タイマー更新用（実時間は state に持たず、UI 側で startedAt から計算）
```

## 使い方の注記

- `Board` は不変として扱う。`revealCell` などは新しい `Board` を返す（`structuredClone` 推奨）
- `now` を `REVEAL` アクションの引数で渡すことで、`game.ts` から `Date.now()` を追放しテスト可能にする
- 経過秒は `(endedAt ?? Date.now()) - startedAt` を UI 側で計算する
- `adjacentMines` は地雷セルでも計算しておく（敗北時に全マスを開示するとき、再計算しなくて済む）
