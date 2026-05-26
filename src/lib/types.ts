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
