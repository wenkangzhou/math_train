import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Question } from '@/types/math'
import { KidSteps } from '@/components/common/KidSteps'
import { themeEmoji } from '@/lib/visualTheme'
import {
  createAdditionTenFramePlan,
  placedIndexesAfterStep,
  remainingAddendsAfterStep,
} from '@/lib/additionTenFrame'

interface AdditionTenFrameHintProps {
  question: Question
}

function AdditionFrame({
  startIndex,
  base,
  added,
  label,
  emoji,
  celebrate,
}: {
  startIndex: number
  base: number
  added: Set<number>
  label: string
  emoji: string
  celebrate: boolean
}) {
  const reduce = useReducedMotion()

  return (
    <div className="rounded-[22px] border-2 border-sky-100 bg-sky-50/70 p-2 shadow-sm">
      <p className="mb-1 text-center text-xs font-extrabold text-sky-deep sm:text-sm ipad-land:text-xs">
        {label}
      </p>
      <div className="grid grid-cols-5 gap-1.5 ipad-land:gap-1">
        {Array.from({ length: 10 }, (_, offset) => {
          const itemIndex = startIndex + offset
          const isBase = itemIndex < base
          const isAdded = added.has(itemIndex)
          const filled = isBase || isAdded

          return (
            <div
              key={itemIndex}
              className={[
                'relative flex h-10 items-center justify-center overflow-hidden rounded-xl border sm:h-11 ipad-land:h-7',
                isAdded
                  ? 'border-coral/50 bg-orange-50'
                  : isBase
                    ? 'border-grass/40 bg-white'
                    : 'border-dashed border-slate-200 bg-white/35',
              ].join(' ')}
            >
              {filled && (
                <motion.span
                  initial={isAdded ? { opacity: 0, y: 8, scale: 0.7 } : false}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: celebrate && !reduce ? [1, 1.12, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="text-xl sm:text-2xl ipad-land:text-lg"
                  aria-hidden="true"
                >
                  {emoji}
                </motion.span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AdditionTenFrameHint({ question }: AdditionTenFrameHintProps) {
  const plan = useMemo(() => createAdditionTenFramePlan(question), [question])
  const emoji = themeEmoji(question.visualTheme)
  const [completedSteps, setCompletedSteps] = useState(0)

  useEffect(() => {
    setCompletedSteps(0)
  }, [question.id])

  const added = useMemo(
    () => new Set(placedIndexesAfterStep(plan, completedSteps)),
    [completedSteps, plan],
  )
  const remaining = remainingAddendsAfterStep(plan, completedSteps)
  const done = completedSteps >= plan.steps.length
  const lastStep = completedSteps > 0 ? plan.steps[completedSteps - 1] : null
  const nextStep = done ? null : plan.steps[completedSteps]
  const doneButtonLabel = plan.answerKind === 'added'
    ? `看见啦，一共加入 ${plan.add} 个`
    : `看见啦，一共有 ${plan.total} 个`

  return (
    <div
      className="rounded-card bg-white/90 p-3 shadow-soft ipad-land:p-1.5"
      data-testid="addition-ten-frame"
    >
      <KidSteps steps={plan.childSteps} />

      <div className="mb-2 flex flex-wrap items-center justify-center gap-1.5 text-sm font-extrabold text-slate-600 ipad-land:mb-1 ipad-land:text-xs">
        <span className="rounded-full bg-grass/15 px-3 py-1 text-emerald-700">
          先有 {plan.base}
        </span>
        <span>+</span>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-coral ring-1 ring-orange-100">
          再来 {plan.add}
        </span>
        <span>=</span>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-deep">
          {plan.answerKind === 'total' ? '?' : plan.total}
        </span>
      </div>

      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2 ipad-land:gap-3">
        <AdditionFrame
          startIndex={0}
          base={plan.base}
          added={added}
          label="第一个十格 · 凑满 10"
          emoji={emoji}
          celebrate={done}
        />
        <AdditionFrame
          startIndex={10}
          base={plan.base}
          added={added}
          label="第二个十格 · 放剩下的"
          emoji={emoji}
          celebrate={done}
        />
      </div>

      <div className="mt-1.5 flex min-h-8 items-center justify-center gap-2 rounded-xl bg-orange-50/70 px-2 py-1 ipad-land:min-h-7">
        <span className="shrink-0 text-[11px] font-extrabold text-coral">
          待加入 {remaining} 个
        </span>
        <span className="flex flex-wrap items-center justify-center gap-0.5" aria-hidden="true">
          {remaining > 0 ? (
            Array.from({ length: remaining }, (_, index) => (
              <span key={`${question.id}-waiting-${completedSteps}-${index}`} className="text-base ipad-land:text-sm">
                {emoji}
              </span>
            ))
          ) : (
            <span className="text-xs font-bold text-grass">都放好啦 🎉</span>
          )}
        </span>
      </div>

      <div
        className="mt-1.5 rounded-2xl bg-cream px-3 py-1.5 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm font-extrabold text-slate-700 sm:text-base ipad-land:text-sm">
          {lastStep ? lastStep.equation : plan.intro}
        </p>
        <p className="mt-0.5 text-xs font-bold text-slate-500 sm:text-sm ipad-land:text-xs">
          {done ? plan.done : `先别急，还有 ${remaining} 个没有放进去。`}
        </p>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2 ipad-land:mt-1.5">
        <button
          type="button"
          onClick={() =>
            setCompletedSteps((step) => Math.min(plan.steps.length, step + 1))
          }
          disabled={done}
          className="min-h-10 rounded-full bg-sky px-5 py-2 text-sm font-extrabold text-white shadow-soft transition enabled:hover:brightness-105 disabled:bg-grass sm:text-base ipad-land:min-h-9 ipad-land:py-1.5 ipad-land:text-sm"
        >
          {done ? doneButtonLabel : nextStep?.action}
        </button>
        {completedSteps > 0 && (
          <button
            type="button"
            onClick={() => setCompletedSteps(0)}
            className="min-h-10 rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-200 ipad-land:min-h-9 ipad-land:py-1.5 ipad-land:text-xs"
          >
            重来
          </button>
        )}
      </div>

      <p className="mt-1 text-center text-[11px] font-semibold text-slate-400 ipad-land:text-[10px]">
        绿色框是原来就有的，橙色框是新加入的。
      </p>
    </div>
  )
}
