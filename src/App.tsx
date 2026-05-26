import { useEffect } from 'react'
import { useGame } from './hooks/useGame'
import { Board } from './components/Board'
import { StatusBar } from './components/StatusBar'
import { DifficultySelector } from './components/DifficultySelector'
import { GameOverlay } from './components/GameOverlay'

function App() {
  const { state, dispatch, elapsedSeconds } = useGame('easy')

  // キーボードショートカット: R=リスタート、1/2/3=難易度切替
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // 入力フォーム等では無視
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key.toLowerCase()) {
        case 'r':
          dispatch({ type: 'RESTART' })
          break
        case '1':
          dispatch({ type: 'SET_DIFFICULTY', difficulty: 'easy' })
          break
        case '2':
          dispatch({ type: 'SET_DIFFICULTY', difficulty: 'medium' })
          break
        case '3':
          dispatch({ type: 'SET_DIFFICULTY', difficulty: 'hard' })
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [dispatch])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-start pt-12 gap-4 px-4">
      <h1 className="text-zinc-300 font-bold text-xl tracking-widest">MINESWEEPER</h1>

      {/* 難易度選択 */}
      <div className="w-full max-w-max">
        <DifficultySelector current={state.difficulty} dispatch={dispatch} />
      </div>

      {/* ステータスバー */}
      <div className="w-full max-w-max">
        <StatusBar
          difficulty={state.difficulty}
          status={state.status}
          flagsUsed={state.flagsUsed}
          elapsedSeconds={elapsedSeconds}
          dispatch={dispatch}
        />
      </div>

      {/* ボード（オーバーレイ付き） */}
      <div className="relative w-full max-w-max">
        <Board
          board={state.board}
          difficulty={state.difficulty}
          status={state.status}
          dispatch={dispatch}
        />
        <GameOverlay status={state.status} dispatch={dispatch} />
      </div>

      {/* ショートカットヒント */}
      <p className="text-zinc-700 text-xs mt-2">
        R: リスタート　1/2/3: 難易度　右クリック: 旗
      </p>
    </div>
  )
}

export default App
