// 数数小火车 / Math Train — 图片题呈现（PRD 功能十三）
// 不直接显示完整算式，用实物图 + 提问 + 答案框，答案仍由数字键盘选择。

import { motion } from 'framer-motion'
import type { Question } from '@/types/math'
import { getPictureBookScene, pictureBookQuestionText } from '@/lib/pictureBook'

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

type PictureItemState = 'solid' | 'new' | 'faded' | 'ghost'

function PictureItems({
  count,
  emoji,
  state = 'solid',
}: {
  count: number
  emoji: string
  state?: PictureItemState
}) {
  const compact = count > 12
  if (count <= 0) {
    return (
      <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-extrabold text-slate-400">
        0 个
      </span>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 ipad-land:gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <motion.span
          key={`${state}-${i}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: state === 'faded' ? 0.42 : 1 }}
          transition={{ delay: i * 0.025, type: 'spring', stiffness: 280, damping: 18 }}
          className={[
            compact
              ? 'flex h-7 w-7 items-center justify-center rounded-lg text-xl shadow-sm ring-1 sm:h-8 sm:w-8 sm:text-2xl ipad-land:h-6 ipad-land:w-6 ipad-land:text-lg'
              : 'flex h-9 w-9 items-center justify-center rounded-xl text-2xl shadow-sm ring-1 sm:h-10 sm:w-10 sm:text-3xl ipad-land:h-8 ipad-land:w-8 ipad-land:text-2xl',
            state === 'ghost'
              ? 'border-2 border-dashed border-sky/50 bg-white/35 text-sky/40 shadow-none ring-0'
              : state === 'new'
                ? 'bg-amber-50 text-amber-700 ring-amber-200 drop-shadow-[0_0_6px_rgba(251,191,36,0.55)]'
                : state === 'faded'
                  ? 'bg-white/50 text-slate-400 line-through grayscale ring-slate-200'
                  : 'bg-white/85 text-slate-700 ring-white',
          ].join(' ')}
          aria-hidden="true"
        >
          {state === 'ghost' ? '?' : emoji}
        </motion.span>
      ))}
    </div>
  )
}

function PictureGroup({
  label,
  count,
  emoji,
  state,
}: {
  label: string
  count: number
  emoji: string
  state?: PictureItemState
}) {
  return (
    <div className="min-w-0 rounded-[22px] bg-white/45 p-2 text-center ring-1 ring-white/70 backdrop-blur-sm ipad-land:p-1.5">
      <p className="mb-1 text-xs font-extrabold text-slate-500">
        {label}
      </p>
      <PictureItems count={count} emoji={emoji} state={state} />
    </div>
  )
}

function PictureScene({ question }: { question: Question }) {
  const scene = getPictureBookScene(question)
  const emoji = scene.itemEmoji
  const L = question.fullLeft
  const R = question.fullRight
  const C = question.fullResult

  let groups: React.ReactNode
  switch (question.pattern) {
    case 'a-plus-b-equals-blank':
      groups = (
        <>
          <PictureGroup label={`先有 ${L} 个`} count={L} emoji={emoji} />
          <PictureGroup label={`又来 ${R} 个`} count={R} emoji={emoji} state="new" />
        </>
      )
      break
    case 'a-minus-b-equals-blank':
      groups = (
        <>
          <PictureGroup label={`留下 ${C} 个`} count={C} emoji={emoji} />
          <PictureGroup label={`离开 ${R} 个`} count={R} emoji={emoji} state="faded" />
        </>
      )
      break
    case 'a-plus-blank-equals-c':
      groups = (
        <>
          <PictureGroup label={`已有 ${L} 个`} count={L} emoji={emoji} />
          <PictureGroup label={`空位到 ${C} 个`} count={C - L} emoji={emoji} state="ghost" />
        </>
      )
      break
    case 'blank-plus-b-equals-c':
      groups = (
        <>
          <PictureGroup label={`现在 ${C} 个`} count={C - R} emoji={emoji} />
          <PictureGroup label={`刚来 ${R} 个`} count={R} emoji={emoji} state="new" />
        </>
      )
      break
    case 'a-minus-blank-equals-c':
      groups = (
        <>
          <PictureGroup label={`还剩 ${C} 个`} count={C} emoji={emoji} />
          <PictureGroup label="谁离开了？" count={L - C} emoji={emoji} state="ghost" />
        </>
      )
      break
    case 'blank-minus-b-equals-c':
      groups = (
        <>
          <PictureGroup label={`还剩 ${C} 个`} count={C} emoji={emoji} />
          <PictureGroup label={`开走 ${R} 个`} count={R} emoji={emoji} state="faded" />
        </>
      )
      break
    default:
      groups = <PictureGroup label="数一数" count={question.answer} emoji={emoji} />
  }

  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${scene.cardClass} p-3 ring-1 ipad-land:p-2.5`}>
      <div className="absolute left-4 top-5 h-5 w-14 rounded-full bg-white/65" />
      <div className="absolute right-8 top-8 h-4 w-10 rounded-full bg-white/55" />
      <div className={`absolute inset-x-0 bottom-0 h-10 ${scene.groundClass}`} />
      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${scene.accentClass}`}>
            {scene.sceneEmoji} {question.storyScene ?? scene.sceneName}
          </span>
          <span className="rounded-full bg-white/65 px-2.5 py-1 text-xs font-bold text-slate-500">
            {scene.actorEmoji} {question.storyActor ?? scene.actor}
          </span>
        </div>
        <div className="grid grid-cols-[64px_minmax(0,1fr)] items-end gap-2 ipad-land:grid-cols-[56px_minmax(0,1fr)]">
          <div className="flex flex-col items-center">
            <span className="text-4xl drop-shadow-sm ipad-land:text-3xl" aria-hidden="true">
              {scene.actorEmoji}
            </span>
            <span className="mt-1 rounded-full bg-white/75 px-2 py-0.5 text-[10px] font-extrabold text-slate-500">
              帮帮我
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {groups}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PictureQuestion({ question, entered, feedback }: PictureQuestionProps) {
  const scene = getPictureBookScene(question)
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
      className={`relative w-full overflow-hidden rounded-card bg-cream px-4 py-4 shadow-soft sm:px-6 ${ring}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-coral">🖼️ 绘本图片题</p>
          <h2 className="mt-0.5 truncate text-xl font-extrabold text-slate-700 sm:text-2xl ipad-land:text-xl">
            {question.storyTitle ?? scene.title}
          </h2>
          <p className="mt-0.5 text-sm font-semibold text-slate-500 ipad-land:text-xs">
            {scene.helperLine}
          </p>
        </div>
      </div>

      <PictureScene question={question} />

      <p className="mt-3 rounded-2xl bg-white/70 px-3 py-2 text-center text-sm font-bold leading-relaxed text-slate-600 ring-1 ring-white ipad-land:mt-2 ipad-land:text-xs">
        {question.story ?? pictureBookQuestionText(question)}
      </p>

      {/* 提问 + 答案框 */}
      <div className="mt-3 flex items-center justify-center gap-3 ipad-land:mt-2">
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
