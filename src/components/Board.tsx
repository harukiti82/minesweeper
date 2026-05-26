import { Cell } from './Cell'
import type { Board as BoardType, DifficultyKey, GameStatus } from '../lib/types'
import type { GameAction } from '../lib/types'

type Props = {
  board: BoardType
  difficulty: DifficultyKey
  status: GameStatus
  dispatch: (action: GameAction) => void
}

export function Board({ board, difficulty, status, dispatch }: Props) {
  const cols = board[0]?.length ?? 9
  const isSmall = difficulty === 'hard'

  // 地雷を踏んだ瞬間のセルを特定（lost 時に ring + pulse を付ける）
  // lost になった最後にクリックされた地雷 = revealed かつ mine、かつ周囲が全て revealed でない地雷はここでは判断できない
  // シンプルに「全地雷を isRevealed にした」タイミングを踏んで「1個だけの地雷」として扱うのではなく、
  // もし複数地雷があれば最初の地雷だけ pulse する（board の走査順序で最初の isRevealed mine）
  const explodedMine: { row: number; col: number } | null = (() => {
    if (status !== 'lost') return null
    for (const row of board) {
      for (const cell of row) {
        if (cell.isMine && cell.isRevealed) return { row: cell.row, col: cell.col }
      }
    }
    return null
  })()

  return (
    <div
      className="bg-zinc-900 rounded-lg p-4 shadow-lg shadow-black/40"
      style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, auto)`, gap: '2px' }}
    >
      {board.flat().map((cell) => (
        <Cell
          key={`${cell.row}-${cell.col}`}
          cell={cell}
          size={isSmall ? 'small' : 'normal'}
          isExploded={
            explodedMine !== null &&
            cell.isMine &&
            cell.row === explodedMine.row &&
            cell.col === explodedMine.col
          }
          onReveal={() => {
            if (status === 'won' || status === 'lost') return
            dispatch({ type: 'REVEAL', row: cell.row, col: cell.col, now: Date.now() })
          }}
          onFlag={() => {
            if (status === 'won' || status === 'lost') return
            dispatch({ type: 'FLAG', row: cell.row, col: cell.col })
          }}
        />
      ))}
    </div>
  )
}
