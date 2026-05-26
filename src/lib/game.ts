import type { Board, Cell, DifficultyKey, GameAction, GameState } from './types'
import { DIFFICULTY_CONFIGS } from './types'

// ──────────────────────────────────────────────
// ヘルパー関数
// ──────────────────────────────────────────────

/** セルの周囲8マスのインデックス一覧を返す（盤面外はスキップ） */
function getNeighbors(rows: number, cols: number, row: number, col: number): [number, number][] {
  const neighbors: [number, number][] = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const r = row + dr
      const c = col + dc
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        neighbors.push([r, c])
      }
    }
  }
  return neighbors
}

/** 初手保護領域のインデックスセットを返す */
function buildProtectedSet(
  rows: number,
  cols: number,
  firstClickRow: number,
  firstClickCol: number,
): Set<number> {
  const protected_ = new Set<number>()
  // クリックセル自身と周囲8マス
  const cells: [number, number][] = [
    [firstClickRow, firstClickCol],
    ...getNeighbors(rows, cols, firstClickRow, firstClickCol),
  ]
  for (const [r, c] of cells) {
    protected_.add(r * cols + c)
  }
  return protected_
}

// ──────────────────────────────────────────────
// 公開関数
// ──────────────────────────────────────────────

/** 空盤面で初期 GameState を生成する（地雷はまだ置かない） */
export function createInitialState(difficulty: DifficultyKey): GameState {
  const { rows, cols } = DIFFICULTY_CONFIGS[difficulty]
  const board: Board = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col): Cell => ({
      row,
      col,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    })),
  )
  return {
    difficulty,
    board,
    status: 'idle',
    startedAt: null,
    endedAt: null,
    flagsUsed: 0,
    isFirstClick: true,
  }
}

/** 初手保護付きで盤面に地雷を配置し、adjacentMines を計算して返す */
export function createBoard(
  difficulty: DifficultyKey,
  firstClickRow: number,
  firstClickCol: number,
): Board {
  const { rows, cols, mines } = DIFFICULTY_CONFIGS[difficulty]
  const protected_ = buildProtectedSet(rows, cols, firstClickRow, firstClickCol)

  // 保護領域外のインデックス一覧
  const candidates: number[] = []
  for (let i = 0; i < rows * cols; i++) {
    if (!protected_.has(i)) candidates.push(i)
  }

  if (candidates.length < mines) {
    throw new Error('Invalid difficulty config: too many mines for the board size')
  }

  // Fisher-Yates シャッフルで先頭 mines 個を地雷にする
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }
  const mineIndices = new Set(candidates.slice(0, mines))

  // セルを構築
  const board: Board = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col): Cell => ({
      row,
      col,
      isMine: mineIndices.has(row * cols + col),
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    })),
  )

  // adjacentMines を計算
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const count = getNeighbors(rows, cols, row, col).filter(
        ([r, c]) => board[r][c].isMine,
      ).length
      board[row][col].adjacentMines = count
    }
  }

  return board
}

/** 全非地雷セルが開封済みなら true */
export function checkWin(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isMine && !cell.isRevealed) return false
    }
  }
  return true
}

/**
 * セルをクリックして開封する。
 * - 初手なら盤面を生成してから開封
 * - 地雷なら全地雷を開示して lost
 * - adjacentMines === 0 なら BFS で連鎖開封
 */
export function revealCell(state: GameState, row: number, col: number, now: number): GameState {
  // 事前チェック（仕様どおりの順序）
  if (state.status === 'won' || state.status === 'lost') return state
  if (state.board[row][col].isFlagged) return state
  if (state.board[row][col].isRevealed) return state

  // 初手: 盤面を生成
  let board = state.isFirstClick
    ? createBoard(state.difficulty, row, col)
    : structuredClone(state.board)

  // 地雷を踏んだ
  if (board[row][col].isMine) {
    // 全地雷を開示
    for (const r of board) {
      for (const cell of r) {
        if (cell.isMine) cell.isRevealed = true
      }
    }
    return {
      ...state,
      board,
      status: 'lost',
      endedAt: now,
      isFirstClick: false,
      startedAt: state.startedAt ?? now,
    }
  }

  // 非地雷: BFS で開封
  const rows = board.length
  const cols = board[0].length
  const queue: [number, number][] = [[row, col]]
  board[row][col].isRevealed = true

  while (queue.length > 0) {
    const [r, c] = queue.shift()!
    if (board[r][c].adjacentMines !== 0) continue
    for (const [nr, nc] of getNeighbors(rows, cols, r, c)) {
      const neighbor = board[nr][nc]
      if (neighbor.isRevealed || neighbor.isFlagged || neighbor.isMine) continue
      neighbor.isRevealed = true
      queue.push([nr, nc])
    }
  }

  const won = checkWin(board)
  return {
    ...state,
    board,
    status: won ? 'won' : 'playing',
    startedAt: state.startedAt ?? now,
    endedAt: won ? now : null,
    isFirstClick: false,
  }
}

/** 旗をトグルする */
export function toggleFlag(state: GameState, row: number, col: number): GameState {
  // 事前チェック
  if (state.status !== 'idle' && state.status !== 'playing') return state
  if (state.board[row][col].isRevealed) return state

  const board = structuredClone(state.board)
  const cell = board[row][col]
  cell.isFlagged = !cell.isFlagged
  const delta = cell.isFlagged ? 1 : -1

  return {
    ...state,
    board,
    flagsUsed: state.flagsUsed + delta,
  }
}

/** useGame フックから呼ばれる reducer */
export function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START':
      return createInitialState(action.difficulty)
    case 'REVEAL':
      return revealCell(state, action.row, action.col, action.now)
    case 'FLAG':
      return toggleFlag(state, action.row, action.col)
    case 'RESTART':
      return createInitialState(state.difficulty)
    case 'SET_DIFFICULTY':
      return createInitialState(action.difficulty)
    case 'TICK':
      return state
    default: {
      // 網羅性チェック（TypeScript が exhaustive check できるように）
      const _: never = action
      return _
    }
  }
}
