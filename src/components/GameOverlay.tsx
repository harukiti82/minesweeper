import type { GameStatus } from '../lib/types'
import type { GameAction } from '../lib/types'

type Props = {
  status: GameStatus
  dispatch: (action: GameAction) => void
}

export function GameOverlay({ status, dispatch }: Props) {
  if (status !== 'won' && status !== 'lost') return null

  const isWon = status === 'won'

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm rounded-lg z-10">
      <div
        className={`bg-zinc-900 border border-zinc-700 rounded-xl p-8 flex flex-col items-center gap-6 ${
          isWon ? 'shadow-[0_0_40px_rgba(99,102,241,0.4)]' : ''
        }`}
      >
        <h2
          className={`text-3xl font-bold ${isWon ? 'text-indigo-400' : 'text-rose-400'}`}
        >
          {isWon ? '🎉 Clear!' : '💥 Game Over'}
        </h2>
        <button
          onClick={() => dispatch({ type: 'RESTART' })}
          className="px-6 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-colors duration-150"
        >
          もう一度
        </button>
      </div>
    </div>
  )
}
