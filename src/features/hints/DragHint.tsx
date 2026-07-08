// 数数小火车 / Math Train — 拖拽物品提示（PRD 功能二）
// 通过「摆一摆」理解加减法。支持鼠标 / 触摸 / iPad；点按为拖拽兜底。
// 仅作视觉辅助，答案仍由数字键盘选择（PRD 4.3「不直接自动提交」）。

import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Question } from '@/types/math'
import { themeEmoji } from '@/lib/visualTheme'
import { KidSteps } from '@/components/common/KidSteps'

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

function dragSteps(q: Question, mode: Mode): string[] {
  if (mode === 'takeaway') {
    return q.pattern === 'a-minus-blank-equals-c'
      ? ['拖走到剩下', '数拖走几个', '按拿走数']
      : ['拖走开走的', '数这里剩下', '按剩下数']
  }
  if (mode === 'fill') {
    return q.pattern === 'blank-plus-b-equals-c'
      ? ['先看总数', '补满空位', '按原来数']
      : ['补满空位', '数补了几个', '按还差数']
  }
  return q.pattern === 'blank-minus-b-equals-c'
    ? ['把两边合上', '数一共有', '按原来数']
    : ['拖到一起', '数一共有', '按总数']
}

// 单个可拖动物品：拖入目标区或点按即放置；未命中自动弹回。
// 用 div 代替 button：iOS Safari 上 button 的默认触摸/点击行为容易和 framer-motion drag 冲突，
// 导致孩子手指按住拖动时手势被浏览器截走、拖不动。
function pointerFromEvent(
  e: MouseEvent | TouchEvent | PointerEvent,
): { x: number; y: number } | null {
  if ('changedTouches' in e) {
    const t = (e as TouchEvent).changedTouches[0]
    if (t) return { x: t.clientX, y: t.clientY }
  }
  if ('clientX' in e) {
    const p = e as MouseEvent | PointerEvent
    return { x: p.clientX, y: p.clientY }
  }
  return null
}

function rectsOverlap(a: DOMRect, b: DOMRect): boolean {
  return !(
    a.right < b.left ||
    a.left > b.right ||
    a.bottom < b.top ||
    a.top > b.bottom
  )
}

// 单个可拖动物品：拖入目标区或点按即放置；未命中自动弹回。
// 用 div 代替 button：iOS Safari 上 button 的默认触摸/点击行为容易和 framer-motion drag 冲突。
// drop 检测用「元素是否与目标区重叠」或「手指是否在目标区附近」，比 info.point（元素原点）更准。
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
  const committedRef = useRef(false)
  const itemRef = useRef<HTMLDivElement>(null)
  const commitPlacement = () => {
    if (committedRef.current) return
    committedRef.current = true
    onPlaced()
  }

  return (
    <motion.div
      ref={itemRef}
      drag
      dragSnapToOrigin
      dragElastic={0}
      dragMomentum={false}
      onDragStart={() => {
        draggedRef.current = true
      }}
      onDragEnd={(e) => {
        const target = targetRef.current?.getBoundingClientRect()
        const item = itemRef.current?.getBoundingClientRect()
        let hit = false
        if (target && item) {
          // 主要判断：拖动的物品和目标区只要有重叠，就算命中
          hit = rectsOverlap(item, target)
        }
        if (!hit) {
          // 兜底：手指 release 位置在目标区附近（含 40px 容错）也算命中
          const p = pointerFromEvent(e)
          if (p && target) {
            const tolerance = 40
            hit =
              p.x >= target.left - tolerance &&
              p.x <= target.right + tolerance &&
              p.y >= target.top - tolerance &&
              p.y <= target.bottom + tolerance
          }
        }
        if (hit) {
          commitPlacement()
        }
        // 稍后复位标记，避免拖拽结束误触发 click
        window.setTimeout(() => {
          draggedRef.current = false
        }, 80)
      }}
      onClick={() => {
        if (draggedRef.current) return
        commitPlacement()
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        commitPlacement()
      }}
      whileDrag={{ scale: 1.25, zIndex: 50 }}
      whileTap={{ scale: 1.1 }}
      role="button"
      tabIndex={0}
      aria-label="拖一拖"
      className="inline-flex h-12 w-12 cursor-grab touch-none select-none items-center justify-center text-3xl active:cursor-grabbing sm:h-14 sm:w-14 sm:text-4xl ipad-land:h-10 ipad-land:w-10 ipad-land:text-2xl"
    >
      {emoji}
    </motion.div>
  )
}

// 静态物品（已放置 / 预置）
function StaticItem({ emoji, faded }: { emoji: string; faded?: boolean }) {
  return (
    <span
      className={[
        'inline-flex h-12 w-12 items-center justify-center text-3xl sm:h-14 sm:w-14 sm:text-4xl ipad-land:h-10 ipad-land:w-10 ipad-land:text-2xl',
        faded ? 'opacity-40 grayscale' : '',
      ].join(' ')}
    >
      {emoji}
    </span>
  )
}

function Ghost() {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white/40 sm:h-14 sm:w-14 ipad-land:h-10 ipad-land:w-10" />
  )
}

const tray =
  'flex min-h-[68px] flex-wrap items-center justify-center gap-1 rounded-2xl p-2 sm:min-h-[76px] ipad-land:min-h-[54px] ipad-land:p-1'

export function DragHint({ question }: DragHintProps) {
  const emoji = themeEmoji(question.visualTheme)
  const sc = useMemo(() => buildScenario(question), [question])
  const [placed, setPlaced] = useState(0)
  const targetRef = useRef<HTMLDivElement>(null)

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
      <div className="rounded-card bg-white/85 p-3 shadow-soft ipad-land:p-2">
        <KidSteps steps={dragSteps(question, sc.mode)} />
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          {/* 这里（可拖走） */}
          <div>
            <p className="mb-1 text-center text-sm font-semibold text-slate-500">这里</p>
            <div className={`${tray} bg-sky-soft/40`}>
              {Array.from({ length: remaining }, (_, i) => (
                <DraggableItem
                  key={`${question.id}-take-${placed}-${i}`}
                  emoji={emoji}
                  targetRef={targetRef}
                  onPlaced={place}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center text-2xl text-slate-300">→</div>
          {/* 开走啦 */}
          <div>
            <p className="mb-1 text-center text-sm font-semibold text-coral">开走啦</p>
            <div ref={targetRef} className={`${tray} border-2 border-dashed border-coral/40 bg-coral/5`}>
              {Array.from({ length: placed }, (_, i) => (
                <StaticItem key={`${question.id}-gone-${i}`} emoji={emoji} faded />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-base font-medium text-slate-600 sm:text-lg ipad-land:mt-1 ipad-land:text-sm">{caption}</p>
        <p className="mt-1 text-center text-xs font-semibold text-slate-400">
          拖不动也没关系，点一下物品也能放过去。
        </p>
      </div>
    )
  }

  // combine / fill 共享：上方目标区 + 下方来源区
  return (
    <div className="rounded-card bg-white/85 p-3 shadow-soft ipad-land:p-2">
      <KidSteps steps={dragSteps(question, sc.mode)} />
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
      <p className="mb-1 mt-3 text-center text-sm font-semibold text-slate-500 ipad-land:mt-2">
        待加入（还剩 {remaining} 个）
      </p>
      <div className={`${tray} bg-sky-soft/30`}>
        {Array.from({ length: remaining }, (_, i) => (
          <DraggableItem
            key={`${question.id}-source-${placed}-${i}`}
            emoji={emoji}
            targetRef={targetRef}
            onPlaced={place}
          />
        ))}
        {remaining === 0 && (
          <span className="text-sm text-slate-400">都拖好啦 🎉</span>
        )}
      </div>

      <p className="mt-2 text-center text-base font-medium text-slate-600 sm:text-lg ipad-land:mt-1 ipad-land:text-sm">{caption}</p>
      <p className="mt-1 text-center text-xs font-semibold text-slate-400">
        拖不动也没关系，点一下物品也能放上去。
      </p>
    </div>
  )
}
