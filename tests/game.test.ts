import { describe, it, expect } from 'vitest'
import {
  createBoard,
  createInitialState,
  revealCell,
  toggleFlag,
  checkWin,
  reducer,
} from '../src/lib/game'
import type { Board, Cell, GameState } from '../src/lib/types'
import { DIFFICULTY_CONFIGS } from '../src/lib/types'

// ──────────────────────────────────────────────
// テスト用ヘルパー
// ──────────────────────────────────────────────

/** 手動で盤面を組む: mine_positions に地雷を配置し adjacentMines を計算 */
function buildManualBoard(
  rows: number,
  cols: number,
  minePositions: [number, number][],
): Board {
  const mineSet = new Set(minePositions.map(([r, c]) => r * cols + c))

  const board: Board = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col): Cell => ({
      row,
      col,
      isMine: mineSet.has(row * cols + col),
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    })),
  )

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = row + dr
          const nc = col + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) count++
        }
      }
      board[row][col].adjacentMines = count
    }
  }

  return board
}

/** 手動盤面を使った GameState を生成（isFirstClick: false で直接操作できるように） */
function makeState(board: Board): GameState {
  return {
    difficulty: 'easy',
    board,
    status: 'playing',
    startedAt: 1000,
    endedAt: null,
    flagsUsed: 0,
    isFirstClick: false,
  }
}

// ──────────────────────────────────────────────
// createBoard のテスト
// ──────────────────────────────────────────────

describe('createBoard', () => {
  it('Easy で地雷数が 10 個', () => {
    const board = createBoard('easy', 4, 4)
    const mineCount = board.flat().filter((c) => c.isMine).length
    expect(mineCount).toBe(DIFFICULTY_CONFIGS.easy.mines)
  })

  it('初手保護: (4,4) クリック時、(4,4) と周囲8マスに地雷がない（100回試行）', () => {
    for (let i = 0; i < 100; i++) {
      const board = createBoard('easy', 4, 4)
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          expect(board[4 + dr][4 + dc].isMine).toBe(false)
        }
      }
    }
  })

  it('adjacentMines の整合性: 全マスで周囲地雷数と一致', () => {
    const board = createBoard('easy', 0, 0)
    const { rows, cols } = DIFFICULTY_CONFIGS.easy
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let expected = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue
            const nr = row + dr
            const nc = col + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) expected++
          }
        }
        expect(board[row][col].adjacentMines).toBe(expected)
      }
    }
  })

  it('Medium で地雷数が 40 個', () => {
    const board = createBoard('medium', 8, 8)
    const mineCount = board.flat().filter((c) => c.isMine).length
    expect(mineCount).toBe(DIFFICULTY_CONFIGS.medium.mines)
  })
})

// ──────────────────────────────────────────────
// revealCell のテスト
// ──────────────────────────────────────────────

describe('revealCell', () => {
  it('初手は盤面生成を伴い isFirstClick が false になる', () => {
    const initial = createInitialState('easy')
    expect(initial.isFirstClick).toBe(true)
    const next = revealCell(initial, 4, 4, 2000)
    expect(next.isFirstClick).toBe(false)
    expect(next.startedAt).toBe(2000)
    expect(next.status).toBe('playing')
  })

  it('初手クリック位置に地雷がない（100回試行）', () => {
    for (let i = 0; i < 100; i++) {
      const initial = createInitialState('easy')
      const next = revealCell(initial, 4, 4, 1000)
      // lost にならない = 地雷を踏んでいない
      expect(next.status).not.toBe('lost')
    }
  })

  it('adjacentMines=0 のセルを開くと隣接する 0 セルが連鎖開封される', () => {
    // 3x3 盤面で右上の1マスだけ地雷（(0,2)）
    // (0,0) を開くと adjacentMines=0 なので連鎖が起きる
    //   (0,0)=0, (0,1)=1, (0,2)=mine
    //   (1,0)=0, (1,1)=1, (1,2)=1
    //   (2,0)=0, (2,1)=0, (2,2)=0
    const board = buildManualBoard(3, 3, [[0, 2]])
    const state = makeState(board)
    const next = revealCell(state, 2, 0, 2000)

    // adjacentMines=0 のセルは連鎖で全開封されるはず
    // (2,0), (2,1), (2,2), (1,0) は 0 連鎖で開封される
    // (0,0) も連鎖するが (0,1) は adjacentMines=1 なので止まる
    expect(next.board[2][0].isRevealed).toBe(true)
    expect(next.board[2][1].isRevealed).toBe(true)
    expect(next.board[2][2].isRevealed).toBe(true)
    expect(next.board[1][0].isRevealed).toBe(true)
    expect(next.board[0][0].isRevealed).toBe(true)
    // 地雷セルは開封されない
    expect(next.board[0][2].isRevealed).toBe(false)
  })

  it('旗付きセルは開けない', () => {
    const board = buildManualBoard(3, 3, [[0, 2]])
    const state = makeState(board)
    // (1,1) に旗を立てる
    const flagged = toggleFlag(state, 1, 1)
    const next = revealCell(flagged, 1, 1, 2000)
    expect(next.board[1][1].isRevealed).toBe(false)
  })

  it('地雷を踏むと status: lost、全地雷が isRevealed: true', () => {
    // (1,1) が地雷
    const board = buildManualBoard(3, 3, [[1, 1]])
    const state = makeState(board)
    const next = revealCell(state, 1, 1, 3000)
    expect(next.status).toBe('lost')
    expect(next.endedAt).toBe(3000)
    // 全地雷が開示されている
    for (const row of next.board) {
      for (const cell of row) {
        if (cell.isMine) expect(cell.isRevealed).toBe(true)
      }
    }
  })

  it('勝利条件達成で status: won', () => {
    // 2x2 で (0,0) だけ地雷
    const board = buildManualBoard(2, 2, [[0, 0]])
    const state = makeState(board)
    // (0,1), (1,0), (1,1) を順に開封
    const s1 = revealCell(state, 0, 1, 1000)
    const s2 = revealCell(s1, 1, 0, 1000)
    const s3 = revealCell(s2, 1, 1, 2000)
    expect(s3.status).toBe('won')
    expect(s3.endedAt).toBe(2000)
  })

  it('won/lost 状態では何もしない', () => {
    const board = buildManualBoard(2, 2, [[0, 0]])
    const wonState: GameState = { ...makeState(board), status: 'won' }
    const next = revealCell(wonState, 1, 1, 9999)
    expect(next).toBe(wonState) // 同じ参照が返る
  })
})

// ──────────────────────────────────────────────
// toggleFlag のテスト
// ──────────────────────────────────────────────

describe('toggleFlag', () => {
  it('未開封セルに旗を立てられる', () => {
    const board = buildManualBoard(3, 3, [[0, 0]])
    const state = makeState(board)
    const next = toggleFlag(state, 1, 1)
    expect(next.board[1][1].isFlagged).toBe(true)
    expect(next.flagsUsed).toBe(1)
  })

  it('旗を外すと flagsUsed が減る', () => {
    const board = buildManualBoard(3, 3, [[0, 0]])
    const state = makeState(board)
    const flagged = toggleFlag(state, 1, 1)
    const unflagged = toggleFlag(flagged, 1, 1)
    expect(unflagged.board[1][1].isFlagged).toBe(false)
    expect(unflagged.flagsUsed).toBe(0)
  })

  it('開封済みセルには旗を立てられない', () => {
    const board = buildManualBoard(3, 3, [[0, 0]])
    const state = makeState(board)
    const revealed = revealCell(state, 2, 2, 1000)
    expect(revealed.board[2][2].isRevealed).toBe(true)
    const next = toggleFlag(revealed, 2, 2)
    expect(next.board[2][2].isFlagged).toBe(false)
  })

  it('won/lost 状態では旗操作できない', () => {
    const board = buildManualBoard(2, 2, [[0, 0]])
    const wonState: GameState = { ...makeState(board), status: 'won' }
    const next = toggleFlag(wonState, 1, 1)
    expect(next).toBe(wonState)
  })
})

// ──────────────────────────────────────────────
// checkWin のテスト
// ──────────────────────────────────────────────

describe('checkWin', () => {
  it('全非地雷セルが開封されたら true', () => {
    const board = buildManualBoard(2, 2, [[0, 0]])
    // (0,1), (1,0), (1,1) を開封
    board[0][1].isRevealed = true
    board[1][0].isRevealed = true
    board[1][1].isRevealed = true
    expect(checkWin(board)).toBe(true)
  })

  it('1個でも未開封の非地雷があれば false', () => {
    const board = buildManualBoard(2, 2, [[0, 0]])
    board[0][1].isRevealed = true
    board[1][0].isRevealed = true
    // (1,1) は未開封
    expect(checkWin(board)).toBe(false)
  })
})

// ──────────────────────────────────────────────
// reducer のテスト
// ──────────────────────────────────────────────

describe('reducer', () => {
  it('START アクションで初期状態に戻る', () => {
    const board = buildManualBoard(2, 2, [[0, 0]])
    const state = makeState(board)
    const next = reducer(state, { type: 'START', difficulty: 'medium' })
    expect(next.difficulty).toBe('medium')
    expect(next.status).toBe('idle')
    expect(next.isFirstClick).toBe(true)
  })

  it('RESTART アクションで同じ難易度の初期状態に戻る', () => {
    const initial = createInitialState('easy')
    const afterReveal = revealCell(initial, 4, 4, 1000)
    const restarted = reducer(afterReveal, { type: 'RESTART' })
    expect(restarted.difficulty).toBe('easy')
    expect(restarted.status).toBe('idle')
  })

  it('SET_DIFFICULTY アクションで難易度を変更して初期化', () => {
    const initial = createInitialState('easy')
    const next = reducer(initial, { type: 'SET_DIFFICULTY', difficulty: 'hard' })
    expect(next.difficulty).toBe('hard')
    const { rows, cols } = DIFFICULTY_CONFIGS.hard
    expect(next.board.length).toBe(rows)
    expect(next.board[0].length).toBe(cols)
  })

  it('TICK アクションは状態を変えない', () => {
    const state = createInitialState('easy')
    const next = reducer(state, { type: 'TICK' })
    expect(next).toBe(state)
  })
})
