// 数数小火车 / Math Train — 拖拽物品提示（PRD 功能二）
// 通过「摆一摆」理解加减法。支持鼠标 / 触摸 / iPad；点按为拖拽兜底。
// 仅作视觉辅助，答案仍由数字键盘选择（PRD 4.3「不直接自动提交」）。

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Question } from '@/types/math'
import { themeEmoji } from '@/lib/visualTheme'

interface DragHintProps {
  question: Question
}

type Mode = 'combine' | 'fill' | 'takeaway'

interface Scenario {
  mode: Mode
  // combine：两组合起来
  groupA: number
  groupB: number
  total: number
  // fill：从 base 填到 target
  base: number
  // takeaway：start 个拿走 remove 个，剩 remain
  start: number
  remove: number
  remain: number
}

function buildScenario(q: Question): Scenario {
  const L = q.fullLeft
  const R = q.fullRight
  const C = q.fullResult
  const blank = { mode: 'combine' as Mode, groupA: 0, groupB: 0, total: 0, base: 0, start: 0, remove: 0, remain: 0 }
  switch (q.pattern) {
    case 'a-plus-b-equals-blank':
      return { ...blank, mode: 'combine', groupA: L, groupB: R, total: C }
    case 'blank-minus-b-equals-c':
      return { ...blank, mode: 'combine', groupA: C, groupB: R, total: L }
    case 'a-plus-blank-equals-c':
      return { ...blank, mode: 'fill', base: L, groupB: C - L, total: C }
    case 'blank-plus-b-equals-c':
      return { ...blank, mode: 'fill', base: R, groupB: C - R, total: C }
    case 'a-minus-b-equals-blank':
      return { ...blank, mode: 'takeaway', start: L, remove: R, remain: C }
    case 'a-minus-blank-equals-c':
      return { ...blank, mode: 'takeaway', start: L, remove: L - C, remain: C }
    default:
      return blank
  }
}

// 单个可拖动物品：拖入目标区或点按即放置；未命中自动弹回。
// 用 div 代替 button：iOS Safari 上 button 的默认触摸/点击行为容易和 framer-motion drag 冲突，
// 导致孩子手指按住拖动时手势被浏览器截走、拖不动。
function DraggableItem({
  emoji,
  targetRef,
  onPlaced,
}: {
  emoji: string
  targetRef: React.RefObject<HTMLElement>
  onPlaced: () => void
}) {
  const draggedRef = useRef(false)

  return (
    <motion.div
      drag
      dragSnapToOrigin
      dragElastic={0}
      dragMomentum={false}
      onDragStart={() => {
        draggedRef.current = true
      }}
      onDragEnd={(_, info) => {
        const r = targetRef.current?.getBoundingClientRect()
        const { x, y } = info.point
        // 给目标区留 16px 容错边距，孩子手指 release 时不必那么精确
        const tolerance = 16
        if (
          r &&
          x >= r.left - tolerance &&
          x <= r.right + tolerance &&
          y >= r.top - tolerance &&
          y <= r.bottom + tolerance
        ) {
          onPlaced()
        }
        // 稍后复位标记，避免拖拽结束误触发 click
        window.setTimeout(() => {
          draggedRef.current = false
        }, 80)
      }}
      onClick={() => {
        if (draggedRef.current) return
        onPlaced()
      }}
      whileDrag={{ scale: 1.25, zIndex: 50 }}
      whileTap={{ scale: 1.1 }}
      role="button"
      tabIndex={0}
      aria-label="拖一拖"
      className="inline-flex h-12 w-12 cursor-grab touch-none select-none items-center justify-center text-3xl active:cursor-grabbing sm:h-14 sm:w-14 sm:text-4xl"
    >
      {emoji}
    </motion.div>
  )
}

// 静态物品（已放置 / 预置）
function StaticItem({ emoji, faded }: { emoji: string; faded?: boolean }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      className={[
        'inline-flex h-12 w-12 items-center justify-center text-3xl sm:h-14 sm:w-14 sm:text-4xl',
        faded ? 'opacity-40 grayscale' : '',
      ].join(' ')}
    >
      {emoji}
    </motion.span>
  )
}

function Ghost() {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white/40 sm:h-14 sm:w-14" />
  )
}

const tray =
  'flex min-h-[68px] flex-wrap items-center justify-center gap-1 rounded-2xl p-2 sm:min-h-[76px]'

export function DragHint({ question }: DragHintProps) {
  const emoji = themeEmoji(question.visualTheme)
  const sc = useMemo(() => buildScenario(question), [question])
  const [placed, setPlaced] = useState(0)
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setPlaced(0)
  }, [question.id])

  const movable =
    sc.mode === 'combine' ? sc.groupB : sc.mode === 'fill' ? sc.groupB : sc.remove
  const remaining = movable - placed
  const done = placed >= movable
  const place = () => setPlaced((p) => Math.min(movable, p + 1))

  // —— 文案 ——
  const running =
    sc.mode === 'combine'
      ? sc.groupA + placed
      : sc.mode === 'fill'
        ? sc.base + placed
        : sc.start - placed
  const caption = done
    ? sc.mode === 'takeaway'
      ? `还剩 ${running} 个！数对了就在下面选答案吧。`
      : `一共 ${running} 个！数对了就在下面选答案吧。`
    : sc.mode === 'takeaway'
      ? '把要开走的拖到右边「开走啦」。'
      : '把下面的物品拖到上面「合起来」。'

  // —— 三种布局 ——
  if (sc.mode === 'takeaway') {
    return (
      <div className="rounded-card bg-white/85 p-4 shadow-soft">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          {/* 这里（可拖走） */}
          <div>
            <p className="mb-1 text-center text-sm font-semibold text-slate-500">这里</p>
            <div className={`${tray} bg-sky-soft/40`}>
              {Array.from({ length: remaining }, (_, i) => (
                <DraggableItem key={i} emoji={emoji} targetRef={targetRef} onPlaced={place} />
              ))}
            </div>
          </div>
          <div className="flex items-center text-2xl text-slate-300">→</div>
          {/* 开走啦 */}
          <div>
            <p className="mb-1 text-center text-sm font-semibold text-coral">开走啦</p>
            <div ref={targetRef} className={`${tray} border-2 border-dashed border-coral/40 bg-coral/5`}>
              {Array.from({ length: placed }, (_, i) => (
                <StaticItem key={i} emoji={emoji} faded />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-base font-medium text-slate-600 sm:text-lg">{caption}</p>
      </div>
    )
  }

  // combine / fill 共享：上方目标区 + 下方来源区
  return (
    <div className="rounded-card bg-white/85 p-4 shadow-soft">
      {/* 目标区 */}
      <p className="mb-1 text-center text-sm font-semibold text-grass">
        {sc.mode === 'fill' ? `目标 ${sc.total} 个` : '合起来'}
      </p>
      <div ref={targetRef} className={`${tray} border-2 border-dashed border-grass/50 bg-grass/5`}>
        {/* 预置（已有） */}
        {Array.from({ length: sc.mode === 'combine' ? sc.groupA : sc.base }, (_, i) => (
          <StaticItem key={`base-${i}`} emoji={emoji} />
        ))}
        {/* 已拖入 */}
        {Array.from({ length: placed }, (_, i) => (
          <StaticItem key={`p-${i}`} emoji={emoji} />
        ))}
        {/* fill 模式显示剩余空位 */}
        {sc.mode === 'fill' &&
          Array.from({ length: Math.max(0, sc.total - sc.base - placed) }, (_, i) => (
            <Ghost key={`g-${i}`} />
          ))}
      </div>

      {/* 来源区 */}
      <p className="mb-1 mt-3 text-center text-sm font-semibold text-slate-500">
        待加入（还剩 {remaining} 个）
      </p>
      <div className={`${tray} bg-sky-soft/30`}>
        {Array.from({ length: remaining }, (_, i) => (
          <DraggableItem key={i} emoji={emoji} targetRef={targetRef} onPlaced={place} />
        ))}
        {remaining === 0 && (
          <span className="text-sm text-slate-400">都拖好啦 🎉</span>
        )}
      </div>

      <p className="mt-2 text-center text-base font-medium text-slate-600 sm:text-lg">{caption}</p>
    </div>
  )
}
