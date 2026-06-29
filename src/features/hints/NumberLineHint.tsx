// 数数小火车 / Math Train — 数轴提示（PRD 功能一）
// 加法向右走、减法向左走、缺项题数走了几步；小火车逐格跳动。

import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Question } from '@/types/math'

interface NumberLineHintProps {
  question: Question
}

export function NumberLineHint({ question }: NumberLineHintProps) {
  const reduce = useReducedMotion()
  const max = question.range // 10 | 20
  const isAdd = question.operation === 'addition'
  const start = question.fullLeft
  const totalSteps = question.fullRight
  const end = question.fullResult

  // 当前已走的步数（0..totalSteps）
  const [step, setStep] = useState(0)
  useEffect(() => {
    setStep(0)
  }, [question.id])

  const current = isAdd ? start + step : start - step
  const reachedEnd = step >= totalSteps

  const ticks = useMemo(
    () => Array.from({ length: max + 1 }, (_, i) => i),
    [max],
  )

  const pct = (v: number) => (v / max) * 100

  const caption = useMemo(() => {
    if (!reachedEnd) {
      return isAdd
        ? `从 ${start} 出发，向右一步一步走。`
        : `从 ${start} 出发，向左一步一步走。`
    }
    if (question.pattern.includes('blank')) {
      return `小火车从 ${start} 走到 ${end}，一共走了 ${totalSteps} 步！`
    }
    return isAdd
      ? `${start} 向右走 ${totalSteps} 步，停在 ${end}。`
      : `${start} 向左走 ${totalSteps} 步，停在 ${end}。`
  }, [reachedEnd, isAdd, start, end, totalSteps, question.pattern])

  return (
    <div className="rounded-card bg-white/85 p-4 shadow-soft">
      {/* 数轴主体（窄屏可横向滚动） */}
      <div className="overflow-x-auto pb-2">
        <div
          className="relative mx-auto mt-8 px-6"
          style={{ minWidth: max > 10 ? 560 : 320, height: 64 }}
        >
          {/* 轨道线 */}
          <div className="absolute left-0 right-0 top-9 h-1.5 rounded-full bg-sky-soft" />

          {/* 走过的轨迹高亮 */}
          <motion.div
            className="absolute top-9 h-1.5 rounded-full bg-sky"
            initial={false}
            animate={{
              left: `${pct(Math.min(start, current))}%`,
              width: `${Math.abs(pct(current) - pct(start))}%`,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          />

          {/* 刻度 */}
          {ticks.map((n) => {
            const active = n === current
            const isAnchor = n === start || n === end
            return (
              <div
                key={n}
                className="absolute top-6 flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${pct(n)}%` }}
              >
                <span
                  className={[
                    'h-3 w-3 rounded-full border-2',
                    active
                      ? 'border-sky bg-sky'
                      : isAnchor
                        ? 'border-coral bg-coral'
                        : 'border-slate-300 bg-white',
                  ].join(' ')}
                />
                <span
                  className={[
                    'mt-1 font-digit text-sm',
                    active
                      ? 'font-bold text-sky-deep'
                      : isAnchor
                        ? 'font-bold text-coral'
                        : 'text-slate-400',
                  ].join(' ')}
                >
                  {n}
                </span>
              </div>
            )
          })}

          {/* 小火车标记 */}
          <motion.div
            className="absolute -top-1 -translate-x-1/2 text-2xl"
            initial={false}
            animate={{ left: `${pct(current)}%`, y: reduce ? 0 : [0, -6, 0] }}
            transition={{
              left: { type: 'spring', stiffness: 260, damping: 22 },
              y: { duration: 0.4 },
            }}
            aria-hidden="true"
          >
            🚂
          </motion.div>
        </div>
      </div>

      <p className="mt-1 text-center text-base font-medium text-slate-600 sm:text-lg">
        {caption}
      </p>

      {/* 控制按钮 */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
          disabled={reachedEnd}
          className="rounded-full bg-sky px-5 py-2.5 text-base font-bold text-white shadow-soft transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:bg-slate-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/50"
        >
          {isAdd ? '向右一步 →' : '← 向左一步'}
        </button>
        <button
          type="button"
          onClick={() => setStep(0)}
          className="rounded-full bg-slate-100 px-4 py-2.5 text-base font-bold text-slate-500 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
        >
          重来
        </button>
      </div>
    </div>
  )
}
