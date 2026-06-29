import { motion } from 'framer-motion'
import type { Question } from '@/types/math'

interface QuestionCardProps {
  question: Question
  entered: number | null
  // 反馈状态：触发卡片弹跳或晃动
  feedback: 'idle' | 'correct' | 'wrong'
}

// 单个数字/空位的展示
function Slot({
  value,
  isBlank,
  entered,
  state,
}: {
  value: number | null
  isBlank: boolean
  entered: number | null
  state: 'idle' | 'correct' | 'wrong'
}) {
  if (!isBlank) {
    return (
      <span className="font-digit text-6xl text-slate-800 sm:text-8xl">
        {value}
      </span>
    )
  }

  // 空位：彩色圆形 / 虚线框
  const showValue = entered !== null
  const ring =
    state === 'correct'
      ? 'border-grass bg-green-50 text-grass'
      : state === 'wrong'
        ? 'border-coral bg-orange-50 text-coral'
        : showValue
          ? 'border-sky bg-sky-soft/40 text-sky-deep'
          : 'border-dashed border-sky/70 bg-white text-sky'

  return (
    <motion.span
      key={showValue ? `v-${entered}` : 'blank'}
      initial={showValue ? { scale: 0.5, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className={[
        'inline-flex h-20 w-20 items-center justify-center rounded-3xl border-4 font-digit text-5xl sm:h-28 sm:w-28 sm:text-7xl',
        ring,
      ].join(' ')}
    >
      {showValue ? entered : '?'}
    </motion.span>
  )
}

export function QuestionCard({ question, entered, feedback }: QuestionCardProps) {
  const sign = question.operation === 'addition' ? '+' : '−'

  const cardAnim =
    feedback === 'correct'
      ? { scale: [1, 1.06, 1], y: [0, -6, 0] }
      : feedback === 'wrong'
        ? { x: [0, -12, 12, -8, 8, 0] }
        : { scale: 1 }

  return (
    <motion.div
      animate={cardAnim}
      transition={{ duration: feedback === 'wrong' ? 0.45 : 0.5 }}
      className={[
        'relative flex w-full items-center justify-center gap-3 rounded-card bg-cream px-4 py-10 shadow-soft sm:gap-5 sm:py-16 ipad-land:min-h-[250px] ipad-land:py-8',
        feedback === 'correct'
          ? 'ring-4 ring-grass/50'
          : feedback === 'wrong'
            ? 'ring-4 ring-coral/50'
            : 'ring-1 ring-amber-100',
      ].join(' ')}
    >
      <Slot
        value={question.left}
        isBlank={question.left === null}
        entered={entered}
        state={feedback}
      />
      <span className="font-digit text-5xl text-slate-400 sm:text-7xl">
        {sign}
      </span>
      <Slot
        value={question.right}
        isBlank={question.right === null}
        entered={entered}
        state={feedback}
      />
      <span className="font-digit text-5xl text-slate-400 sm:text-7xl">=</span>
      <Slot
        value={question.result}
        isBlank={question.result === null}
        entered={entered}
        state={feedback}
      />
    </motion.div>
  )
}
