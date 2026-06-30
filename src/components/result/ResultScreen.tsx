import { motion } from 'framer-motion'
import type { PracticeResult } from '@/types/math'
import type { Carriage, RouteReward } from '@/types/rewards'
import { resultLevel } from '@/lib/difficulty'
import { Star } from 'lucide-react'
import { TrainMascot } from '@/components/common/TrainMascot'
import { Celebration } from './Celebration'
import { ResultSummary } from './ResultSummary'
import { ResultActions } from './ResultActions'
import { ArrivalRewardCard } from './ArrivalRewardCard'

interface ResultScreenProps {
  result: PracticeResult
  totalStars: number
  newlyUnlocked: Carriage[]
  routeReward: RouteReward | null
  onReplay: () => void
  onPracticeWrong: () => void
  onReconfigure: () => void
}

export function ResultScreen({
  result,
  totalStars,
  newlyUnlocked,
  routeReward,
  onReplay,
  onPracticeWrong,
  onReconfigure,
}: ResultScreenProps) {
  const level = resultLevel(result.accuracy)

  return (
    <div className="relative mx-auto flex min-h-screen-safe max-w-xl flex-col items-center justify-center px-4 py-8 sm:max-w-2xl sm:px-6 ipad-land:max-w-5xl ipad-land:py-6">
      <Celebration />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="z-10 grid w-full gap-5 rounded-[34px] bg-white/75 p-6 shadow-soft ring-1 ring-white/80 backdrop-blur sm:p-8 ipad-land:grid-cols-[0.9fr_1.4fr] ipad-land:items-center ipad-land:gap-8 ipad-land:p-9"
      >
        <div className="flex flex-col items-center text-center">
          <TrainMascot mood="cheer" size={150} />

          {/* 等级（始终正向） */}
          <div className="mt-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 240 }}
              className="text-3xl"
            >
              {level.emoji}
            </motion.div>
            <h1
              className="text-3xl font-extrabold sm:text-4xl"
              style={{ color: level.color }}
            >
              {level.title}
            </h1>
            <p className="mt-1 text-lg font-bold text-slate-600">
              完成 {result.total} 道题，收下 {result.stars} 颗星！
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-extrabold text-amber-600 ring-1 ring-amber-200">
            <Star size={18} fill="currentColor" /> 累计星星 {totalStars}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          {routeReward && <ArrivalRewardCard reward={routeReward} />}

          {newlyUnlocked.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 220 }}
              className="rounded-[24px] bg-gradient-to-r from-amber-100 to-orange-100 p-4 text-center ring-2 ring-amber-300"
            >
              <p className="text-sm font-extrabold text-amber-700">🎉 新机车解锁！</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                {newlyUnlocked.map((item) => (
                  <span key={item.id} className="rounded-2xl bg-white/80 px-4 py-2 text-base font-extrabold text-slate-700 shadow-sm">
                    <span className="mr-1 text-2xl">{item.emoji}</span> {item.name}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          <ResultSummary result={result} />

          <ResultActions
            hasWrong={result.wrongQuestions.length > 0}
            onReplay={onReplay}
            onPracticeWrong={onPracticeWrong}
            onReconfigure={onReconfigure}
          />
        </div>
      </motion.div>
    </div>
  )
}
