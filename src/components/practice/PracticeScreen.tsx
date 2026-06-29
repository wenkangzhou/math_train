import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Hand, Image as ImageIcon, Ruler, Volume2 } from 'lucide-react'
import type {
  AnswerRecord,
  PracticeResult,
  PracticeSettings,
  Question,
} from '@/types/math'
import { PracticeHeader } from './PracticeHeader'
import { QuestionCard } from './QuestionCard'
import { PictureQuestion } from '@/features/questions/PictureQuestion'
import { StoryBanner } from '@/features/questions/StoryBanner'
import { NumberPad } from './NumberPad'
import { VisualHint } from './VisualHint'
import { NumberLineHint } from '@/features/hints/NumberLineHint'
import { DragHint } from '@/features/hints/DragHint'
import { FeedbackOverlay } from './FeedbackOverlay'
import { ConfirmExitDialog } from '@/components/common/ConfirmExitDialog'
import { playCorrect, playWrong, playTap, setSoundEnabled } from '@/lib/sound'
import { speak, cancelSpeech, questionToSpeech } from '@/lib/speech'

type HintPanel = 'none' | 'picture' | 'numberline' | 'drag'

interface PracticeScreenProps {
  questions: Question[]
  settings: PracticeSettings & { soundEnabled?: boolean }
  onComplete: (result: PracticeResult) => void
  onExit: () => void
}

const CORRECT_MSGS = ['答对啦！', '太棒了！', '你真厉害！', '又得到一颗星！', '算得真快！']
const WRONG_MSGS = [
  '差一点，再想一想。',
  '没关系，我们再数一次。',
  '试试看小提示吧。',
  '可以用小火车帮忙数一数。',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function PracticeScreen({
  questions,
  settings,
  onComplete,
  onExit,
}: PracticeScreenProps) {
  const [index, setIndex] = useState(0)
  const [entered, setEntered] = useState<number | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [usedHint, setUsedHint] = useState(false)
  const [showHint, setShowHint] = useState<HintPanel>(
    settings.autoShowVisualHint ? 'picture' : 'none',
  )
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [locked, setLocked] = useState(false)
  const [showExit, setShowExit] = useState(false)

  const [stars, setStars] = useState(0)
  const [streak, setStreak] = useState(0)

  const bestRef = useRef(0)
  const recordsRef = useRef<AnswerRecord[]>([])
  const wrongAnswersRef = useRef<number[]>([])
  const startTimeRef = useRef<number>(Date.now())

  const question = questions[index]
  const total = questions.length
  const maxDigit = question?.range ?? 10
  // 提示等级随答错次数提升（最高 3）
  const hintLevel = Math.min(attempts + (usedHint ? 1 : 0), 3) || 1

  const resetForQuestion = useCallback(() => {
    setEntered(null)
    setAttempts(0)
    setUsedHint(false)
    setShowHint(settings.autoShowVisualHint ? 'picture' : 'none')
    setFeedback('idle')
    setLocked(false)
    wrongAnswersRef.current = []
    startTimeRef.current = Date.now()
    cancelSpeech()
  }, [settings.autoShowVisualHint])

  const finish = useCallback(() => {
    const records = recordsRef.current
    const correctCount = records.filter((r) => r.isCorrect).length
    const wrongIds = new Set(
      records.filter((r) => !r.isCorrect).map((r) => r.questionId),
    )
    const wrongQuestions = questions.filter((q) => wrongIds.has(q.id))
    const hintsUsed = records.filter((r) => r.usedHint).length
    const result: PracticeResult = {
      questions,
      records,
      stars: correctCount,
      correctCount,
      total,
      accuracy: total > 0 ? correctCount / total : 0,
      bestStreak: bestRef.current,
      hintsUsed,
      wrongQuestions,
    }
    onComplete(result)
  }, [questions, total, onComplete])

  const advance = useCallback(() => {
    if (index + 1 >= total) {
      finish()
    } else {
      setIndex((i) => i + 1)
      resetForQuestion()
    }
  }, [index, total, finish, resetForQuestion])

  const handleConfirm = useCallback(() => {
    if (entered === null || locked || feedback !== 'idle' || !question) return
    const correct = entered === question.answer

    if (correct) {
      const firstTry = attempts === 0
      setLocked(true)
      setFeedback('correct')
      setFeedbackMsg(pick(CORRECT_MSGS))
      playCorrect()

      recordsRef.current.push({
        questionId: question.id,
        answer: entered,
        isCorrect: firstTry,
        attempts: attempts + 1,
        usedHint,
        durationMs: Date.now() - startTimeRef.current,
        wrongAnswers: [...wrongAnswersRef.current],
      })

      if (firstTry) {
        setStars((s) => s + 1)
        setStreak((s) => {
          const n = s + 1
          bestRef.current = Math.max(bestRef.current, n)
          return n
        })
      } else {
        setStreak(0)
      }

      window.setTimeout(advance, 1300)
    } else {
      wrongAnswersRef.current.push(entered)
      const nextAttempts = attempts + 1
      setAttempts(nextAttempts)
      setStreak(0)
      setFeedback('wrong')
      setFeedbackMsg(pick(WRONG_MSGS))
      playWrong()
      if (settings.showHintAfterWrongAnswer) {
        setShowHint('picture')
        setUsedHint(true)
      }
      // 晃动结束后清空输入，留在本题继续尝试，不公布答案
      window.setTimeout(() => {
        setEntered(null)
        setFeedback('idle')
      }, 900)
    }
  }, [
    entered,
    locked,
    feedback,
    question,
    attempts,
    usedHint,
    settings.showHintAfterWrongAnswer,
    advance,
  ])

  const handlePick = useCallback(
    (n: number) => {
      if (locked || feedback === 'correct') return
      playTap()
      setEntered(n)
    },
    [locked, feedback],
  )

  // 键盘支持：数字键输入、退格清除、回车确认
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showExit || locked || feedback === 'correct') return
      if (e.key >= '0' && e.key <= '9') {
        const d = Number(e.key)
        setEntered((prev) => {
          if (prev === null) return d <= maxDigit ? d : null
          const combined = prev * 10 + d
          return combined <= maxDigit ? combined : d <= maxDigit ? d : prev
        })
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        setEntered(null)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        handleConfirm()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showExit, locked, feedback, maxDigit, handleConfirm])

  // 切换提示面板：点已开的关闭，否则打开（一次只展开一个）。打开即记为用过提示。
  const openPanel = useCallback((p: HintPanel) => {
    setShowHint((prev) => (prev === p ? 'none' : p))
    setUsedHint(true)
  }, [])

  const speakQuestion = useCallback(() => {
    if (!question) return
    setUsedHint(true)
    // 故事题优先朗读故事，否则朗读算式
    speak(question.story ?? questionToSpeech(question))
  }, [question])

  // 离开练习页时停止朗读
  useEffect(() => cancelSpeech, [])

  useEffect(() => {
    setSoundEnabled(settings.soundEnabled ?? true)
  }, [settings.soundEnabled])

  const currentNumber = useMemo(() => index + 1, [index])

  if (!question) return null

  return (
    <div className="mx-auto flex min-h-screen-safe max-w-3xl flex-col px-4 pb-6 pt-3 sm:px-6 ipad-land:max-w-6xl ipad-land:px-8 ipad-land:pb-5 ipad-land:pt-4">
      <PracticeHeader
        current={currentNumber}
        total={total}
        stars={stars}
        streak={streak}
        onBack={() => setShowExit(true)}
      />

      {/* 内容区：竖屏纵向居中堆叠；横屏两栏（左题目+提示，右键盘） */}
      <div className="mt-3 flex flex-1 flex-col justify-center gap-6 ipad-land:grid ipad-land:grid-cols-[minmax(0,1.35fr)_minmax(390px,0.9fr)] ipad-land:items-center ipad-land:gap-8">
        {/* 左：题目 + 提示（提示面板为 absolute overlay，不推动题目位置） */}
        <div className="relative flex w-full flex-col items-center justify-center gap-4">
          <FeedbackOverlay state={feedback} message={feedbackMsg} />

          <div className="w-full space-y-3">
            {question.format === 'story' && (
              <StoryBanner question={question} onSpeak={speakQuestion} />
            )}
            {question.format === 'picture' ? (
              <PictureQuestion
                question={question}
                entered={entered}
                feedback={feedback}
              />
            ) : (
              <QuestionCard question={question} entered={entered} feedback={feedback} />
            )}
          </div>

          {/* 提示工具栏 + 浮层面板 */}
          <div className="relative w-full">
            <div className="flex flex-wrap items-center justify-center gap-2 ipad-land:gap-2.5">
              <HintTab
                active={showHint === 'picture'}
                onClick={() => openPanel('picture')}
                icon={<ImageIcon size={18} />}
                label="图片"
              />
              <HintTab
                active={showHint === 'numberline'}
                onClick={() => openPanel('numberline')}
                icon={<Ruler size={18} />}
                label="数轴"
              />
              <HintTab
                active={showHint === 'drag'}
                onClick={() => openPanel('drag')}
                icon={<Hand size={18} />}
                label="拖一拖"
              />
              <HintTab
                active={false}
                onClick={speakQuestion}
                icon={<Volume2 size={18} />}
                label="朗读"
              />
            </div>

            <AnimatePresence>
              {showHint !== 'none' && (
                <motion.div
                  key={showHint}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  role="region"
                  aria-label="学习辅助内容"
                  className="relative z-20 mt-3 max-h-[min(44dvh,420px)] overflow-y-auto overscroll-contain rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-slate-100 ipad-land:absolute ipad-land:bottom-full ipad-land:left-0 ipad-land:right-0 ipad-land:mb-3 ipad-land:mt-0 ipad-land:max-h-[360px] ipad-land:p-2"
                >
                  {showHint === 'picture' && (
                    <VisualHint question={question} level={hintLevel} />
                  )}
                  {showHint === 'numberline' && (
                    <NumberLineHint question={question} />
                  )}
                  {showHint === 'drag' && <DragHint question={question} />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 右：数字键盘 */}
        <div className="w-full ipad-land:flex ipad-land:w-auto ipad-land:flex-col ipad-land:justify-center ipad-land:rounded-[30px] ipad-land:bg-white/25 ipad-land:p-4 ipad-land:ring-1 ipad-land:ring-white/60">
          <NumberPad
            max={maxDigit}
            entered={entered}
            disabled={locked || feedback === 'correct'}
            onPick={handlePick}
            onClear={() => setEntered(null)}
            onConfirm={handleConfirm}
          />
        </div>
      </div>

      <ConfirmExitDialog
        open={showExit}
        onContinue={() => setShowExit(false)}
        onExit={onExit}
      />
    </div>
  )
}

// 提示工具栏按钮
function HintTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold shadow-soft transition focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 sm:text-base ipad-land:px-4 ipad-land:py-2 ipad-land:text-sm',
        active
          ? 'bg-amber-400 text-white'
          : 'bg-amber-100 text-amber-600 hover:bg-amber-200',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  )
}
