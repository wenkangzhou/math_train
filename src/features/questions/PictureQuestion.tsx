// 数数小火车 / Math Train — 图片题呈现（PRD 功能十三）
// 不直接显示完整算式，用实物图 + 提问 + 答案框，答案仍由数字键盘选择。

import { motion } from 'framer-motion'
import type { Question } from '@/types/math'
import { VisualHint } from '@/components/practice/VisualHint'

interface PictureQuestionProps {
  question: Question
  entered: number | null
  feedback: 'idle' | 'correct' | 'wrong'
}

const PROMPT: Record<Question['pattern'], string> = {
  'a-plus-b-equals-blank': '现在一共有几个？',
  'a-plus-blank-equals-c': '还差几个？',
  'blank-plus-b-equals-c': '原来有几个？',
  'a-minus-b-equals-blank': '还剩几个？',
  'a-minus-blank-equals-c': '走了几个？',
  'blank-minus-b-equals-c': '原来有几个？',
}

export function PictureQuestion({ question, entered, feedback }: PictureQuestionProps) {
  const cardAnim =
    feedback === 'correct'
      ? { scale: [1, 1.04, 1] }
      : feedback === 'wrong'
        ? { x: [0, -10, 10, -6, 6, 0] }
        : { scale: 1 }

  const ring =
    feedback === 'correct'
      ? 'ring-4 ring-grass/50'
      : feedback === 'wrong'
        ? 'ring-4 ring-coral/50'
        : 'ring-1 ring-amber-100'

  return (
    <motion.div
      animate={cardAnim}
      transition={{ duration: feedback === 'wrong' ? 0.45 : 0.4 }}
      className={`relative w-full rounded-card bg-cream px-4 py-5 shadow-soft sm:px-6 ${ring}`}
    >
      {/* 实物图（复用图片提示的分组渲染） */}
      <VisualHint question={question} level={1} />

      {/* 提问 + 答案框 */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <span className="text-lg font-bold text-slate-700 sm:text-2xl">
          {PROMPT[question.pattern]}
        </span>
        <motion.span
          key={entered === null ? 'blank' : `v-${entered}`}
          initial={entered === null ? false : { scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={[
            'inline-flex h-16 w-16 items-center justify-center rounded-3xl border-4 font-digit text-4xl sm:h-20 sm:w-20 sm:text-5xl',
            entered !== null
              ? 'border-sky bg-sky-soft/40 text-sky-deep'
              : 'border-dashed border-sky/70 bg-white text-sky',
          ].join(' ')}
        >
          {entered !== null ? entered : '?'}
        </motion.span>
      </div>
    </motion.div>
  )
}
