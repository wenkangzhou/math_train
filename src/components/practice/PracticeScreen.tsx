import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'
import type {
  AnswerRecord,
  PracticeResult,
  PracticeSettings,
  Question,
} from '@/types/math'
import { PracticeHeader } from './PracticeHeader'
import { QuestionCard } from './QuestionCard'
import { NumberPad } from './NumberPad'
import { VisualHint } from './VisualHint'
import { FeedbackOverlay } from './FeedbackOverlay'
import { ConfirmExitDialog } from '@/components/common/ConfirmExitDialog'
import { TrainMascot, type MascotMood } from '@/components/common/TrainMascot'
import { playCorrect, playWrong, playTap } from '@/lib/sound'

interface PracticeScreenProps {
  questions: Question[]
  settings: PracticeSettings
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
  const [showHint, setShowHint] = useState(settings.autoShowVisualHint)
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [locked, setLocked] = useState(false)
  const [showExit, setShowExit] = useState(false)

  const [stars, setStars] = useState(0)
  const [streak, setStreak] = useState(0)

  const bestRef = useRef(0)
  const recordsRef = useRef<AnswerRecord[]>([])
  const startTimeRef = useRef<number>(Date.now())

  const question = questions[index]
  const total = questions.length
  const maxDigit = question?.range ?? 10
  // 提示等级随答错次数提升（最高 3）
  const hintLevel = Math.min(attempts + (usedHint ? 1 : 0), 3) || 1

  const mascotMood: MascotMood =
    feedback === 'correct' ? 'cheer' : feedback === 'wrong' ? 'thinking' : 'idle'

  const resetForQuestion = useCallback(() => {
    setEntered(null)
    setAttempts(0)
    setUsedHint(false)
    setShowHint(settings.autoShowVisualHint)
    setFeedback('idle')
    setLocked(false)
    startTimeRef.current = Date.now()
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
      const nextAttempts = attempts + 1
      setAttempts(nextAttempts)
      setStreak(0)
      setFeedback('wrong')
      setFeedbackMsg(pick(WRONG_MSGS))
      playWrong()
      if (settings.showHintAfterWrongAnswer) {
        setShowHint(true)
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

  const toggleHint = () => {
    setShowHint((v) => {
      const next = !v
      if (next) setUsedHint(true)
      return next
    })
  }

  const currentNumber = useMemo(() => index + 1, [index])

  if (!question) return null

  return (
    <div className="mx-auto flex min-h-screen-safe max-w-3xl flex-col px-4 pb-6 pt-4 sm:px-6 ipad-land:max-w-5xl">
      <PracticeHeader
        current={currentNumber}
        total={total}
        stars={stars}
        streak={streak}
        onBack={() => setShowExit(true)}
      />

      {/* 内容区：竖屏纵向居中堆叠；横屏两栏（左题目+提示，右键盘） */}
      <div className="mt-4 flex flex-1 flex-col justify-center gap-6 ipad-land:grid ipad-land:grid-cols-[1fr_minmax(360px,440px)] ipad-land:items-center ipad-land:gap-8">
        {/* 左：题目 + 提示 */}
        <div className="relative flex w-full flex-col items-center justify-center gap-4">
          <FeedbackOverlay state={feedback} message={feedbackMsg} />

          <div className="w-full">
            <QuestionCard question={question} entered={entered} feedback={feedback} />
          </div>

          {/* 提示按钮 + 提示区 */}
          <div className="w-full">
            {!showHint ? (
              <button
                type="button"
                onClick={toggleHint}
                className="mx-auto flex items-center gap-2 rounded-full bg-amber-100 px-5 py-2.5 text-base font-bold text-amber-600 shadow-soft transition hover:bg-amber-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
              >
                <Lightbulb size={20} fill="currentColor" /> 看看小提示
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <VisualHint question={question} level={hintLevel} />
                {!settings.autoShowVisualHint && (
                  <button
                    type="button"
                    onClick={() => setShowHint(false)}
                    className="mx-auto mt-2 block text-sm font-medium text-slate-400 underline-offset-2 hover:underline"
                  >
                    收起提示
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* 右：数字键盘（横屏纵向居中贴右） */}
        <div className="w-full ipad-land:flex ipad-land:w-auto ipad-land:flex-col ipad-land:justify-center">
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

      {/* 角落吉祥物 */}
      <div className="pointer-events-none fixed bottom-safe right-safe z-0 opacity-90">
        <TrainMascot mood={mascotMood} size={56} />
      </div>

      <ConfirmExitDialog
        open={showExit}
        onContinue={() => setShowExit(false)}
        onExit={onExit}
      />
    </div>
  )
}
