import type { DifficultyKey } from '../lib/types'
import { DIFFICULTY_CONFIGS } from '../lib/types'
import type { GameAction } from '../lib/types'

type Props = {
  current: DifficultyKey
  dispatch: (action: GameAction) => void
}

const LABELS: Record<DifficultyKey, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

const KEYS: DifficultyKey[] = ['easy', 'medium', 'hard']

export function DifficultySelector({ current, dispatch }: Props) {
  return (
    <div className="bg-zinc-900 rounded-lg px-4 py-3 shadow-lg shadow-black/40 flex items-center gap-2 w-full">
      <span className="text-zinc-400 text-sm mr-2">難易度</span>
      {KEYS.map((key) => {
        const config = DIFFICULTY_CONFIGS[key]
        const isActive = key === current
        return (
          <button
            key={key}
            onClick={() => dispatch({ type: 'SET_DIFFICULTY', difficulty: key })}
            className={`px-3 py-1 rounded text-sm font-bold transition-colors duration-150 ${
              isActive
                ? 'bg-indigo-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100'
            }`}
            title={`${LABELS[key]}: ${config.rows}×${config.cols} / 地雷${config.mines}個`}
          >
            {LABELS[key]}
          </button>
        )
      })}
      <span className="text-zinc-600 text-xs ml-auto">
        {DIFFICULTY_CONFIGS[current].rows}×{DIFFICULTY_CONFIGS[current].cols} /
        地雷 {DIFFICULTY_CONFIGS[current].mines}
      </span>
    </div>
  )
}
