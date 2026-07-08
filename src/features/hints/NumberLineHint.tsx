// 数数小火车 / Math Train — 数轴提示（PRD 功能一）
// 加法向右走、减法向左走、缺项题数走了几步；小火车逐格跳动。

import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Question } from '@/types/math'
import { KidSteps } from '@/components/common/KidSteps'
import { createNumberLinePlan, numberLineCurrentValue } from '@/lib/numberLinePlan'

interface NumberLineHintProps {
  question: Question
}

export function NumberLineHint({ question }: NumberLineHintProps) {
  const reduce = useReducedMotion()
  const max = question.range // 10 | 20
  const plan = useMemo(() => createNumberLinePlan(question), [question])
  const { start, end, steps: totalSteps, direction } = plan

  // 当前已走的步数（0..totalSteps）
  const [step, setStep] = useState(0)
  useEffect(() => {
    setStep(0)
  }, [question.id])

  const current = numberLineCurrentValue(plan, step)
  const reachedEnd = step >= totalSteps

  const ticks = useMemo(
    () => Array.from({ length: max + 1 }, (_, i) => i),
    [max],
  )

  const pct = (v: number) => (v / max) * 100

  const caption = useMemo(() => {
    if (reachedEnd) return plan.done
    if (step === 0) return plan.intro
    return `现在停在 ${current}，已经走了 ${step} 步。`
  }, [current, plan.done, plan.intro, reachedEnd, step])

  return (
    <div className="rounded-card bg-white/85 p-3 shadow-soft ipad-land:p-2">
      <KidSteps steps={plan.stepLabels} />

      {/* 数轴主体（窄屏可横向滚动） */}
      <div className="overflow-x-auto pb-1">
        <div
          className="mx-auto mt-5 px-6 ipad-land:mt-4"
          style={{ minWidth: max > 10 ? 560 : 320 }}
        >
          {/* 内层轨道让 0 和最大值两端各留 24px，避免标签与火车被裁掉。 */}
          <div className="relative h-[58px]">
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
      </div>

      <p className="mt-1 text-center text-sm font-bold text-slate-600 sm:text-base ipad-land:text-sm">
        {caption}
      </p>
      <p className="mt-0.5 text-center text-xs font-semibold text-slate-400">
        已走 {step}/{totalSteps} 步
        {plan.answerKind === 'steps' && reachedEnd ? '，走的步数就是答案' : ''}
      </p>

      {/* 控制按钮 */}
      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
          disabled={reachedEnd}
          className="rounded-full bg-sky px-5 py-2 text-sm font-bold text-white shadow-soft transition enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:bg-slate-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/50 sm:text-base ipad-land:text-sm"
        >
          {direction === 'right' ? '向右一步 →' : '← 向左一步'}
        </button>
        <button
          type="button"
          onClick={() => setStep(0)}
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300 sm:text-base ipad-land:text-sm"
        >
          重来
        </button>
      </div>
    </div>
  )
}
