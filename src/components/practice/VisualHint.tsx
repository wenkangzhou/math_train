import { motion } from 'framer-motion'
import { useState } from 'react'
import type { Question } from '@/types/math'
import { themeEmoji } from '@/lib/visualTheme'
import { KidSteps } from '@/components/common/KidSteps'

type ItemState = 'solid' | 'faded' | 'ghost' | 'new'

interface VisualHintProps {
  question: Question
  // 提示等级只控制讲解深度；物品下标始终由孩子点按后显示。
  level?: number
}

// 单个可点击物品：点击轻微放大并显示当前序号（PRD 7.3）
function Item({
  emoji,
  state,
  index,
}: {
  emoji: string
  state: ItemState
  index: number
}) {
  const [tapped, setTapped] = useState(false)

  if (state === 'ghost') {
    return (
      <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white/40 sm:h-14 sm:w-14 ipad-land:h-10 ipad-land:w-10">
        <span className="text-2xl opacity-25 sm:text-3xl ipad-land:text-xl">{emoji}</span>
      </span>
    )
  }

  return (
    <motion.button
      type="button"
      initial={{ scale: 0, opacity: 0 }}
      animate={
        state === 'faded'
          ? { scale: 1, opacity: 0.35, x: [0, 6, 0] }
          : { scale: tapped ? 1.25 : 1, opacity: 1 }
      }
      transition={{ type: 'spring', stiffness: 300, damping: 18, delay: index * 0.04 }}
      onClick={() => setTapped((t) => !t)}
      className="relative inline-flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14 ipad-land:h-10 ipad-land:w-10"
      aria-label={`第 ${index + 1} 个，点一下${tapped ? '隐藏' : '显示'}序号`}
      aria-pressed={tapped}
    >
      <span
        className={[
          'text-3xl sm:text-4xl ipad-land:text-2xl',
          state === 'faded' ? 'line-through grayscale' : '',
          state === 'new' ? 'drop-shadow-[0_0_6px_rgba(255,179,0,0.8)]' : '',
        ].join(' ')}
      >
        {emoji}
      </span>
      {tapped && state !== 'faded' && (
        <span className="absolute -bottom-1 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-sky text-[11px] font-bold text-white">
          {index + 1}
        </span>
      )}
    </motion.button>
  )
}

function Group({
  count,
  state,
  emoji,
  startIndex = 0,
}: {
  count: number
  state: ItemState
  emoji: string
  startIndex?: number
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 ipad-land:gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <Item
          key={startIndex + i}
          emoji={emoji}
          state={state}
          index={startIndex + i}
        />
      ))}
    </div>
  )
}

const Divider = ({ symbol }: { symbol: string }) => (
  <span className="px-1 text-3xl font-bold text-slate-400 sm:text-4xl">
    {symbol}
  </span>
)

function visualSteps(question: Question): string[] {
  switch (question.pattern) {
    case 'a-plus-b-equals-blank':
      return ['先数左边', '再数右边', '按总数']
    case 'a-minus-b-equals-blank':
      return ['看一共有', '划掉开走的', '按剩下']
    case 'a-plus-blank-equals-c':
      return ['看已有', '数空位', '按还差几个']
    case 'blank-plus-b-equals-c':
      return ['看总数', '圈后来数', '按原来几个']
    case 'a-minus-blank-equals-c':
      return ['看原来数', '比剩下多多少', '按拿走几个']
    case 'blank-minus-b-equals-c':
      return ['看剩下', '加回开走的', '按原来几个']
    default:
      return ['看图', '数一数', '按答案']
  }
}

export function VisualHint({ question, level = 1 }: VisualHintProps) {
  const emoji = themeEmoji(question.visualTheme)
  const { fullLeft, fullRight, fullResult, pattern } = question

  let body: React.ReactNode = null
  let text = ''

  switch (pattern) {
    // 3 + 2 = ?
    case 'a-plus-b-equals-blank': {
      body = (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Group count={fullLeft} state="solid" emoji={emoji} />
          <Divider symbol="+" />
          <Group count={fullRight} state="solid" emoji={emoji} startIndex={fullLeft} />
        </div>
      )
      text = `先数一数左边 ${fullLeft} 个，再把右边 ${fullRight} 个也加进来。`
      break
    }

    // 5 - 2 = ?  先显示 5 个，其中 2 个被拿走
    case 'a-minus-b-equals-blank': {
      const remain = fullLeft - fullRight
      body = (
        <div className="flex flex-wrap items-center justify-center gap-1">
          <Group count={remain} state="solid" emoji={emoji} />
          <Group count={fullRight} state="faded" emoji={emoji} startIndex={remain} />
        </div>
      )
      text = `一共有 ${fullLeft} 个，开走了 ${fullRight} 个，还剩几个？`
      break
    }

    // 3 + ? = 5  左边已有 3，目标 5，缺位用虚线
    case 'a-plus-blank-equals-c': {
      const missing = fullResult - fullLeft
      body = (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="w-14 text-right text-sm font-semibold text-slate-500">已有</span>
            <Group count={fullLeft} state="solid" emoji={emoji} />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-14 text-right text-sm font-semibold text-slate-500">目标</span>
            <Group count={fullLeft} state="solid" emoji={emoji} />
            <Group count={missing} state="ghost" emoji={emoji} />
          </div>
        </div>
      )
      text = `已经有 ${fullLeft} 个，还差几个才能变成 ${fullResult} 个？`
      break
    }

    // ? + 2 = 5  总数 5，其中后加入的 2 个高亮，其余为待求
    case 'blank-plus-b-equals-c': {
      const unknown = fullResult - fullRight
      body = (
        <div className="flex flex-wrap items-center justify-center gap-1">
          <Group count={unknown} state="solid" emoji={emoji} />
          <Divider symbol="+" />
          <Group count={fullRight} state="new" emoji={emoji} startIndex={unknown} />
        </div>
      )
      text = `原来有几个，又来了 ${fullRight} 个，一共是 ${fullResult} 个？`
      break
    }

    // 5 - ? = 3  一开始 5，最后剩 3
    case 'a-minus-blank-equals-c': {
      const removed = fullLeft - fullResult
      body = (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="w-14 text-right text-sm font-semibold text-slate-500">原来</span>
            <Group count={fullResult} state="solid" emoji={emoji} />
            <Group count={removed} state="faded" emoji={emoji} startIndex={fullResult} />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-14 text-right text-sm font-semibold text-slate-500">剩下</span>
            <Group count={fullResult} state="solid" emoji={emoji} />
          </div>
        </div>
      )
      text = `原来有 ${fullLeft} 个，最后剩 ${fullResult} 个，拿走了几个？`
      break
    }

    // ? - 2 = 3  剩下 3 + 开走 2，合起来
    case 'blank-minus-b-equals-c': {
      body = (
        <div className="flex flex-wrap items-center justify-center gap-1">
          <Group count={fullResult} state="solid" emoji={emoji} />
          <Divider symbol="+" />
          <Group count={fullRight} state="faded" emoji={emoji} startIndex={fullResult} />
        </div>
      )
      text = `开走了 ${fullRight} 个，还剩 ${fullResult} 个。把它们合起来，原来有几个？`
      break
    }
  }

  return (
    <div className="rounded-card bg-white/80 p-4 shadow-soft ipad-land:p-3">
      <KidSteps steps={visualSteps(question)} />
      <div className="min-h-[72px] py-1 ipad-land:min-h-[60px]">{body}</div>
      <p className="mt-2 text-center text-base font-medium text-slate-600 sm:text-lg ipad-land:mt-1 ipad-land:text-sm">
        {text}
      </p>
      <p className="mt-1 text-center text-xs font-semibold text-slate-400">
        小提示：点一下图案，可以看到它是第几个。
      </p>
      {level >= 3 && <CountingProcess question={question} />}
    </div>
  )
}

// 第三级提示：简单的数数过程（PRD 第十节）
function CountingProcess({ question }: { question: Question }) {
  const { pattern, fullLeft, fullResult, answer } = question
  let seq: number[] = []
  let caption = ''

  if (pattern === 'a-plus-b-equals-blank' || pattern === 'blank-plus-b-equals-c') {
    const from = pattern === 'a-plus-b-equals-blank' ? fullLeft : fullResult - answer
    for (let n = from; n <= question.fullResult; n++) seq.push(n)
    caption = `从 ${from} 数到 ${question.fullResult}，一共走了 ${answer} 步。`
  } else if (pattern === 'a-plus-blank-equals-c') {
    for (let n = fullLeft; n <= fullResult; n++) seq.push(n)
    caption = `从 ${fullLeft} 数到 ${fullResult}，一共走了 ${answer} 步。`
  } else {
    // 减法：从大数往小数数
    const from = question.fullLeft
    const to = fullResult
    for (let n = from; n >= to; n--) seq.push(n)
    caption = `从 ${from} 倒着数到 ${to}。`
  }

  return (
    <div className="mt-3 border-t border-slate-100 pt-3 text-center">
      <div className="flex flex-wrap items-center justify-center gap-1 font-digit text-xl text-sky-deep">
        {seq.map((n, i) => (
          <span key={i} className="flex items-center gap-1">
            {n}
            {i < seq.length - 1 && <span className="text-slate-300">→</span>}
          </span>
        ))}
      </div>
      <p className="mt-1 text-sm text-slate-500">{caption}</p>
    </div>
  )
}
