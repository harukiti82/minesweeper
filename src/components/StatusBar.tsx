import { Flag, Clock, RotateCcw } from 'lucide-react'
import type { DifficultyKey, GameStatus } from '../lib/types'
import { DIFFICULTY_CONFIGS } from '../lib/types'
import type { GameAction } from '../lib/types'

type Props = {
  difficulty: DifficultyKey
  status: GameStatus
  flagsUsed: number
  elapsedSeconds: number
  dispatch: (action: GameAction) => void
}

export function StatusBar({ difficulty, status, flagsUsed, elapsedSeconds, dispatch }: Props) {
  const totalMines = DIFFICULTY_CONFIGS[difficulty].mines
  const remainingMines = totalMines - flagsUsed

  // タイマー表示: 999 秒で打ち止め
  const displaySeconds = Math.min(elapsedSeconds, 999)

  return (
    <div className="bg-zinc-900 rounded-lg px-6 py-3 shadow-lg shadow-black/40 flex items-center gap-6 w-full">
      {/* 残地雷数 */}
      <div className="flex items-center gap-2 text-zinc-100 font-bold tabular-nums min-w-[4rem]">
        <Flag size={16} className="text-amber-400" />
        <span>{remainingMines}</span>
      </div>

      {/* ゲームステータス */}
      <div className="flex-1 flex justify-center">
        {status === 'won' && (
          <span className="text-indigo-400 font-bold text-sm">🎉 Clear!</span>
        )}
        {status === 'lost' && (
          <span className="text-rose-400 font-bold text-sm">💥 Game Over</span>
        )}
      </div>

      {/* タイマー */}
      <div className="flex items-center gap-2 text-zinc-100 font-bold tabular-nums min-w-[4rem] justify-end">
        <Clock size={16} className="text-zinc-400" />
        <span>{displaySeconds}</span>
      </div>

      {/* リスタートボタン */}
      <button
        onClick={() => dispatch({ type: 'RESTART' })}
        className="flex items-center justify-center w-8 h-8 rounded-md bg-indigo-500 hover:bg-indigo-400 transition-colors duration-150 text-white"
        title="リスタート (R)"
        aria-label="リスタート"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  )
}
