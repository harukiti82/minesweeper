import { useReducer, useEffect, useCallback } from 'react'
import { reducer, createInitialState } from '../lib/game'
import type { DifficultyKey, GameState, GameAction } from '../lib/types'

export type UseGameReturn = {
  state: GameState
  dispatch: (action: GameAction) => void
  elapsedSeconds: number
}

export function useGame(initialDifficulty: DifficultyKey = 'easy'): UseGameReturn {
  const [state, dispatch] = useReducer(reducer, initialDifficulty, createInitialState)

  // タイマー: playing 中のみ 1 秒ごとに TICK を dispatch して再描画を促す
  useEffect(() => {
    if (state.status !== 'playing') return
    const id = setInterval(() => {
      dispatch({ type: 'TICK' })
    }, 1000)
    return () => clearInterval(id)
  }, [state.status])

  // 経過秒数を計算（UI 側で Date.now() を使う唯一の場所）
  const elapsedSeconds =
    state.startedAt === null
      ? 0
      : Math.floor(((state.endedAt ?? Date.now()) - state.startedAt) / 1000)

  const stableDispatch = useCallback(dispatch, [])

  return { state, dispatch: stableDispatch, elapsedSeconds }
}
