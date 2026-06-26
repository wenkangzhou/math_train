import { motion } from 'framer-motion'
import type { PracticeResult } from '@/types/math'
import { resultLevel } from '@/lib/difficulty'
import { TrainMascot } from '@/components/common/TrainMascot'
import { Celebration } from './Celebration'
import { ResultSummary } from './ResultSummary'
import { ResultActions } from './ResultActions'

interface ResultScreenProps {
  result: PracticeResult
  totalStars: number
  onReplay: () => void
  onPracticeWrong: () => void
  onReconfigure: () => void
  onHome: () => void
}

export function ResultScreen({
  result,
  onReplay,
  onPracticeWrong,
  onReconfigure,
  onHome,
}: ResultScreenProps) {
  const level = resultLevel(result.accuracy)

  return (
    <div className="relative mx-auto flex min-h-screen-safe max-w-xl flex-col items-center justify-center px-4 py-8 sm:px-6 ipad-land:max-w-2xl ipad-land:py-4">
      <Celebration />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="z-10 flex w-full flex-col items-center gap-5 rounded-card bg-white/70 p-6 shadow-soft backdrop-blur sm:p-8"
      >
        <TrainMascot mood="cheer" size={96} />

        {/* 等级（始终正向） */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 240 }}
            className="text-2xl"
          >
            {level.emoji}
          </motion.div>
          <h1
            className="text-3xl font-extrabold sm:text-4xl"
            style={{ color: level.color }}
          >
            {level.title}
          </h1>
          <p className="mt-1 text-lg font-medium text-slate-600">
            今天完成了 {result.total} 道题！
          </p>
          <p className="text-base text-slate-500">
            答对 {result.correctCount} 道，得到 {result.stars} 颗星星！
          </p>
        </div>

        <ResultSummary result={result} />

        <ResultActions
          hasWrong={result.wrongQuestions.length > 0}
          onReplay={onReplay}
          onPracticeWrong={onPracticeWrong}
          onReconfigure={onReconfigure}
          onHome={onHome}
        />
      </motion.div>
    </div>
  )
}
