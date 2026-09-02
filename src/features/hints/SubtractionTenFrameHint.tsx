import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import type { Question } from '@/types/math'
import { playTap } from '@/lib/sound'
import { themeEmoji } from '@/lib/visualTheme'
import {
  completedStepsAfterAction,
  createSubtractionTenFramePlan,
  remainingAfterStep,
  removalTargetGroup,
  removedIndexesAfterStep,
} from '@/lib/subtractionTenFrame'

interface SubtractionTenFrameHintProps {
  question: Question
  // 熟练阶段先让孩子自己观察；答错后可重新显示待拿走格子的完整高亮。
  showTargetPreview?: boolean
}

function TenFrame({
  startIndex,
  filledCount,
  emoji,
  removed,
  pendingRemoval,
  remainingOrder,
  done,
}: {
  startIndex: number
  filledCount: number
  emoji: string
  removed: Set<number>
  pendingRemoval: Set<number>
  remainingOrder: Map<number, number>
  done: boolean
}) {
  const reduce = useReducedMotion()

  return (
    <div
      className="rounded-[22px] border-2 border-sky-100 bg-sky-50/75 p-2 shadow-sm"
      aria-label={`${filledCount} 个物品`}
    >
      <div className="mb-1 flex h-7 items-center justify-center gap-1.5" aria-hidden="true">
        {filledCount === 10 ? (
          <span className="grid grid-cols-5 gap-0.5 rounded-md bg-sky-100 p-1">
            {Array.from({ length: 10 }, (_, index) => (
              <span key={index} className="h-1.5 w-1.5 rounded-[2px] bg-sky-deep" />
            ))}
          </span>
        ) : (
          <span className="h-4 w-4 rounded-full bg-amber-300 ring-2 ring-amber-100" />
        )}
        <span className="font-digit text-xl font-black text-sky-deep">{filledCount}</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5 ipad-land:gap-1">
        {Array.from({ length: 10 }, (_, offset) => {
          const itemIndex = startIndex + offset
          const filled = offset < filledCount
          const isRemoved = filled && removed.has(itemIndex)
          const isPending = filled && pendingRemoval.has(itemIndex)
          const countOrder = remainingOrder.get(itemIndex)

          return (
            <div
              key={itemIndex}
              className={[
                'relative flex h-11 items-center justify-center overflow-hidden rounded-xl border-2 transition-colors duration-300 sm:h-12 ipad-land:h-9',
                filled
                  ? isRemoved
                    ? 'border-coral/30 bg-coral/10'
                    : isPending
                      ? 'border-coral bg-orange-50 ring-2 ring-coral/25'
                    : done
                      ? 'border-grass bg-emerald-50'
                      : 'border-grass/35 bg-white'
                  : 'border-dashed border-slate-200 bg-white/30',
              ].join(' ')}
            >
              {filled && (
                <motion.span
                  initial={false}
                  animate={
                    isRemoved
                      ? { opacity: 0.18, filter: 'grayscale(1)', scale: 0.72, y: 5 }
                      : {
                          opacity: 1,
                          filter: 'grayscale(0)',
                          scale: isPending && !reduce
                            ? [1, 1.12, 1]
                            : done && !reduce
                              ? [1, 1.18, 1]
                              : 1,
                          y: 0,
                        }
                  }
                  transition={{
                    duration: 0.32,
                    delay: reduce ? 0 : offset * 0.035,
                    repeat: isPending && !reduce ? Infinity : 0,
                    repeatDelay: isPending && !reduce ? 0.45 : 0,
                  }}
                  className="text-2xl sm:text-[28px] ipad-land:text-xl"
                  aria-hidden="true"
                >
                  {emoji}
                </motion.span>
              )}
              {isRemoved && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.4, rotate: -18 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: reduce ? 0 : offset * 0.035 }}
                  className="absolute text-2xl font-black text-coral ipad-land:text-xl"
                  aria-hidden="true"
                >
                  ×
                </motion.span>
              )}
              {isPending && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-coral font-digit text-sm font-black text-white shadow-sm"
                  aria-hidden="true"
                >
                  −
                </span>
              )}
              {done && countOrder !== undefined && (
                <motion.span
                  initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: reduce ? 0 : countOrder * 0.06 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-grass px-1 font-digit text-[11px] font-black text-white shadow-sm"
                  aria-hidden="true"
                >
                  {countOrder}
                </motion.span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function equationStart(question: Question): number | '?' {
  return question.pattern === 'blank-minus-b-equals-c' ? '?' : question.fullLeft
}

function equationRemove(question: Question, done: boolean): number | '?' {
  return question.pattern === 'a-minus-blank-equals-c' && !done
    ? '?'
    : question.fullRight
}

function equationRemain(question: Question, done: boolean): number | '?' {
  return question.pattern === 'a-minus-b-equals-blank' && !done
    ? '?'
    : question.fullResult
}

function RemovalButton({
  expression,
  action,
  onClick,
  reduceMotion,
}: {
  expression: string
  action: string
  onClick: () => void
  reduceMotion: boolean
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      aria-label={action}
      className="flex min-h-14 w-full items-center justify-center gap-3 rounded-[22px] bg-coral px-4 font-digit text-2xl font-black text-white shadow-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-coral/30 ipad-land:min-h-12 ipad-land:text-xl"
    >
      <motion.span
        aria-hidden="true"
        animate={reduceMotion ? undefined : { y: [-4, 5, -4] }}
        transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.3 }}
        className="text-3xl leading-none ipad-land:text-2xl"
      >
        ↓
      </motion.span>
      <span aria-hidden="true">{expression}</span>
      <span aria-hidden="true" className="text-lg">▶</span>
    </motion.button>
  )
}

export function SubtractionTenFrameHint({
  question,
  showTargetPreview = true,
}: SubtractionTenFrameHintProps) {
  const reduce = useReducedMotion()
  const plan = useMemo(
    () => createSubtractionTenFramePlan(question),
    [question],
  )
  const emoji = themeEmoji(question.visualTheme)
  const [completedSteps, setCompletedSteps] = useState(0)

  const removed = useMemo(
    () => new Set(removedIndexesAfterStep(plan, completedSteps)),
    [completedSteps, plan],
  )
  const done = plan.remove === 0 || completedSteps >= plan.steps.length
  const nextStep = done ? null : plan.steps[completedSteps]
  const pendingRemoval = useMemo(
    () => new Set(showTargetPreview ? (nextStep?.removeIndexes ?? []) : []),
    [nextStep, showTargetPreview],
  )
  const targetGroup = removalTargetGroup(nextStep)
  const remaining = remainingAfterStep(plan, completedSteps)
  const remainingOrder = useMemo(() => {
    const order = new Map<number, number>()
    if (!done) return order
    let count = 0
    for (let itemIndex = 0; itemIndex < plan.start; itemIndex += 1) {
      if (!removed.has(itemIndex)) {
        count += 1
        order.set(itemIndex, count)
      }
    }
    return order
  }, [done, plan.start, removed])

  const answer = question.pattern === 'a-minus-blank-equals-c'
    ? plan.remove
    : plan.remain
  const answerIsRemoved = question.pattern === 'a-minus-blank-equals-c'
  const actionExpression = nextStep
    ? `− ${nextStep.amount}`
    : `= ${answer}`

  const advance = () => {
    if (done) return
    playTap()
    setCompletedSteps((step) => completedStepsAfterAction(plan, step))
  }

  const reset = () => {
    playTap()
    setCompletedSteps(0)
  }

  return (
    <div
      className="rounded-[26px] bg-white/95 p-3 shadow-soft ipad-land:p-2.5"
      data-testid="subtraction-ten-frame"
      data-preview-removal={showTargetPreview}
    >
      <div
        className="mb-2 flex items-center justify-center gap-2 font-digit font-black ipad-land:mb-1.5"
        aria-label={`${question.left ?? '多少'} 减 ${question.right ?? '多少'} 等于 ${question.result ?? '多少'}`}
      >
        <span className="flex min-w-12 items-center justify-center rounded-2xl bg-sky-50 px-3 py-1.5 text-2xl text-sky-deep ring-2 ring-sky-100 ipad-land:text-xl">
          {equationStart(question)}
        </span>
        <span className="text-3xl text-coral ipad-land:text-2xl">−</span>
        <span
          className={[
            'flex min-w-12 items-center justify-center rounded-2xl px-3 py-1.5 text-2xl ring-2 ipad-land:text-xl',
            answerIsRemoved
              ? done
                ? 'bg-grass text-white ring-grass/30'
                : 'bg-white text-sky ring-dashed ring-sky/60'
              : 'bg-coral/10 text-coral ring-coral/20',
          ].join(' ')}
        >
          {equationRemove(question, done)}
        </span>
        <span className="text-2xl text-slate-300">=</span>
        <motion.span
          initial={false}
          animate={done && !reduce ? { scale: [0.75, 1.2, 1] } : { scale: 1 }}
          className={[
            'flex min-w-14 items-center justify-center rounded-2xl px-3 py-1.5 text-3xl ring-2 ipad-land:text-2xl',
            answerIsRemoved
              ? 'bg-sky-50 text-sky-deep ring-sky-100'
              : done
                ? 'bg-grass text-white ring-grass/30'
                : 'bg-white text-sky ring-dashed ring-sky/60',
          ].join(' ')}
        >
          {equationRemain(question, done)}
        </motion.span>
      </div>

      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2.5 ipad-land:gap-3">
        <TenFrame
          startIndex={0}
          filledCount={plan.firstGroupCount}
          emoji={emoji}
          removed={removed}
          pendingRemoval={pendingRemoval}
          remainingOrder={remainingOrder}
          done={done}
        />
        <TenFrame
          startIndex={10}
          filledCount={plan.secondGroupCount}
          emoji={emoji}
          removed={removed}
          pendingRemoval={pendingRemoval}
          remainingOrder={remainingOrder}
          done={done}
        />
      </div>

      <div className="mx-auto mt-2 grid max-w-2xl grid-cols-2 gap-2.5 ipad-land:mt-1.5 ipad-land:gap-3">
        {done ? (
          <div className="col-span-2 flex items-center justify-center gap-2">
            <div
              aria-label={`答案是 ${answer}`}
              className="flex min-h-12 min-w-44 items-center justify-center rounded-[22px] bg-grass px-6 font-digit text-2xl font-black text-white shadow-soft ipad-land:min-h-11 ipad-land:text-xl"
            >
              = {answer}
            </div>
            <button
              type="button"
              onClick={reset}
              aria-label="重新演示"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300 ipad-land:h-11 ipad-land:w-11"
            >
              <RotateCcw size={20} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <>
            {targetGroup === 'first' ? (
              <RemovalButton
                expression={actionExpression}
                action={nextStep?.action ?? ''}
                onClick={advance}
                reduceMotion={Boolean(reduce)}
              />
            ) : (
              <div />
            )}
            {targetGroup === 'second' ? (
              <RemovalButton
                expression={actionExpression}
                action={nextStep?.action ?? ''}
                onClick={advance}
                reduceMotion={Boolean(reduce)}
              />
            ) : (
              <div />
            )}
          </>
        )}
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {done
          ? plan.done
          : nextStep
            ? `${nextStep.action}。现在剩下 ${remaining} 个。`
            : plan.intro}
      </div>
    </div>
  )
}
