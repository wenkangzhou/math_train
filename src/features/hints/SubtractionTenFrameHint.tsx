import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Question } from '@/types/math'
import { KidSteps } from '@/components/common/KidSteps'
import { themeEmoji } from '@/lib/visualTheme'
import {
  createSubtractionTenFramePlan,
  remainingAfterStep,
  removedIndexesAfterStep,
} from '@/lib/subtractionTenFrame'

interface SubtractionTenFrameHintProps {
  question: Question
}

function TenFrame({
  startIndex,
  filledCount,
  label,
  emoji,
  removed,
  celebrate,
}: {
  startIndex: number
  filledCount: number
  label: string
  emoji: string
  removed: Set<number>
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
          const filled = offset < filledCount
          const isRemoved = filled && removed.has(itemIndex)

          return (
            <div
              key={itemIndex}
              className={[
                'relative flex h-10 items-center justify-center overflow-hidden rounded-xl border sm:h-11 ipad-land:h-8',
                filled
                  ? isRemoved
                    ? 'border-coral/20 bg-coral/5'
                    : 'border-grass/40 bg-white'
                  : 'border-dashed border-slate-200 bg-white/35',
              ].join(' ')}
            >
              {filled && (
                <motion.span
                  initial={false}
                  animate={
                    isRemoved
                      ? { opacity: 0.25, filter: 'grayscale(1)', scale: 0.88 }
                      : {
                          opacity: 1,
                          filter: 'grayscale(0)',
                          scale: celebrate && !reduce ? [1, 1.12, 1] : 1,
                        }
                  }
                  transition={{ duration: 0.3 }}
                  className="text-xl sm:text-2xl ipad-land:text-lg"
                  aria-hidden="true"
                >
                  {emoji}
                </motion.span>
              )}
              {isRemoved && (
                <motion.span
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  className="absolute h-0.5 w-8 rotate-[-28deg] rounded-full bg-coral sm:w-9 ipad-land:w-7"
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SubtractionTenFrameHint({
  question,
}: SubtractionTenFrameHintProps) {
  const plan = useMemo(
    () => createSubtractionTenFramePlan(question),
    [question],
  )
  const emoji = themeEmoji(question.visualTheme)
  const [completedSteps, setCompletedSteps] = useState(0)

  useEffect(() => {
    setCompletedSteps(0)
  }, [question.id])

  const removed = useMemo(
    () => new Set(removedIndexesAfterStep(plan, completedSteps)),
    [completedSteps, plan],
  )
  const done = completedSteps >= plan.steps.length
  const lastStep = completedSteps > 0 ? plan.steps[completedSteps - 1] : null
  const nextStep = done ? null : plan.steps[completedSteps]
  const remaining = remainingAfterStep(plan, completedSteps)
  const doneButtonLabel =
    question.pattern === 'a-minus-blank-equals-c'
      ? `看见啦，拿走 ${plan.remove} 个`
      : `看见啦，还剩 ${plan.remain} 个`

  return (
    <div
      className="rounded-card bg-white/90 p-3 shadow-soft ipad-land:p-2"
      data-testid="subtraction-ten-frame"
    >
      <KidSteps steps={plan.childSteps} />

      <div className="mb-2 flex flex-wrap items-center justify-center gap-1.5 text-sm font-extrabold text-slate-600 ipad-land:mb-1 ipad-land:text-xs">
        <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-deep">
          {plan.start}
        </span>
        <span>=</span>
        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-sky-100">10</span>
        <span>+</span>
        <span className="rounded-full bg-white px-3 py-1 ring-1 ring-sky-100">
          {plan.secondGroupCount}
        </span>
      </div>

      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2 ipad-land:gap-3">
        <TenFrame
          startIndex={0}
          filledCount={plan.firstGroupCount}
          label="一整组 · 10 个"
          emoji={emoji}
          removed={removed}
          celebrate={done}
        />
        <TenFrame
          startIndex={10}
          filledCount={plan.secondGroupCount}
          label={`个位组 · ${plan.secondGroupCount} 个`}
          emoji={emoji}
          removed={removed}
          celebrate={done}
        />
      </div>

      <div
        className="mt-2 rounded-2xl bg-cream px-3 py-2 text-center ipad-land:mt-1.5 ipad-land:py-1.5"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm font-extrabold text-slate-700 sm:text-base ipad-land:text-sm">
          {lastStep ? lastStep.equation : plan.intro}
        </p>
        <p className="mt-0.5 text-xs font-bold text-slate-500 sm:text-sm ipad-land:text-xs">
          {done ? plan.done : `现在还有 ${remaining} 个彩色图案。`}
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
        彩色的是留下的，灰色划线的是拿走的。
      </p>
    </div>
  )
}
