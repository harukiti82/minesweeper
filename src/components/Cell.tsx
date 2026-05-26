import { Bomb, Flag } from 'lucide-react'
import type { Cell as CellType } from '../lib/types'

type Props = {
  cell: CellType
  size: 'normal' | 'small'
  isExploded?: boolean   // 踏んだ瞬間のセル（赤リング + pulse）
  onReveal: () => void
  onFlag: (e: React.MouseEvent) => void
}

/** 隣接地雷数 → Tailwind テキストカラー */
const NUMBER_COLORS: Record<number, string> = {
  1: 'text-sky-400',
  2: 'text-emerald-400',
  3: 'text-rose-400',
  4: 'text-violet-400',
  5: 'text-amber-400',
  6: 'text-cyan-300',
  7: 'text-pink-300',
  8: 'text-zinc-300',
}

export function Cell({ cell, size, isExploded = false, onReveal, onFlag }: Props) {
  const sizeClass = size === 'small' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'
  const base = `${sizeClass} flex items-center justify-center border select-none cursor-pointer font-bold tabular-nums transition-colors duration-150`

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onFlag(e)
  }

  // 地雷（敗北開示）
  if (cell.isMine && cell.isRevealed) {
    const explodedClass = isExploded
      ? 'bg-rose-900/60 border-rose-500 ring-2 ring-rose-500 animate-pulse'
      : 'bg-rose-900/40 border-rose-700'
    return (
      <div className={`${base} ${explodedClass}`} onClick={onReveal} onContextMenu={handleContextMenu}>
        <Bomb size={size === 'small' ? 14 : 16} className="text-rose-400" />
      </div>
    )
  }

  // 旗付き（未開封）
  if (cell.isFlagged) {
    return (
      <div
        className={`${base} bg-zinc-800 border-amber-500/40`}
        onClick={onReveal}
        onContextMenu={handleContextMenu}
      >
        <Flag size={size === 'small' ? 12 : 14} className="text-amber-400" />
      </div>
    )
  }

  // 開封済み
  if (cell.isRevealed) {
    const numberColor = cell.adjacentMines > 0 ? NUMBER_COLORS[cell.adjacentMines] ?? 'text-zinc-300' : ''
    return (
      <div
        className={`${base} bg-zinc-900 border-zinc-800 cursor-default ${numberColor}`}
        onContextMenu={handleContextMenu}
      >
        {cell.adjacentMines > 0 ? cell.adjacentMines : null}
      </div>
    )
  }

  // 未開封
  return (
    <div
      className={`${base} bg-zinc-800 border-zinc-700 hover:bg-zinc-700`}
      onClick={onReveal}
      onContextMenu={handleContextMenu}
    />
  )
}
