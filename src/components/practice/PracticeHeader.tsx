import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Flame, Star } from 'lucide-react'
import type { RewardState } from '@/types/rewards'
import { CARRIAGE_CATALOG, getCarriage } from '@/lib/carriages'
import { getTrainRoute } from '@/lib/trainRoutes'
import { TrainEngineArt } from '@/components/rewards/TrainEngineArt'

interface PracticeHeaderProps {
  current: number // 1-based
  total: number
  stars: number
  streak: number
  reward: RewardState
  onBack: () => void
}

export function PracticeHeader({
  current,
  total,
  stars,
  streak,
  reward,
  onBack,
}: PracticeHeaderProps) {
  const reduceMotion = useReducedMotion()
  const [trainMoving, setTrainMoving] = useState(false)
  const progress = total <= 1 ? 0 : Math.round(((current - 1) / (total - 1)) * 100)
  const stationCount = Math.min(Math.max(total, 2), 12)
  const questionsToFinish = Math.max(total - current + 1, 1)
  const selectedTrain = getCarriage(reward.selectedHead) ?? CARRIAGE_CATALOG[0]
  const currentRoute = getTrainRoute(selectedTrain.id)

  useEffect(() => {
    if (reduceMotion) return
    setTrainMoving(true)
    const timer = window.setTimeout(() => setTrainMoving(false), 650)
    return () => window.clearTimeout(timer)
  }, [current, reduceMotion, selectedTrain.id])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="返回设置页"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-soft transition hover:-translate-x-0.5 hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/50"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="rounded-full bg-white/80 px-5 py-2 text-base font-extrabold text-slate-600 shadow-soft">
          第 {current} / {total} 题
        </div>

        <div className="flex items-center gap-2">
          {streak >= 2 && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1.5 text-coral shadow-soft ipad-land:px-2 ipad-land:py-1"
            >
              <Flame size={18} fill="currentColor" className="ipad-land:h-4 ipad-land:w-4" />
              <span className="text-sm font-extrabold ipad-land:text-xs">{streak}</span>
            </motion.div>
          )}
          <div className="flex min-h-10 items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-amber-500 shadow-soft">
            <Star size={20} fill="currentColor" />
            <span className="font-extrabold" id="star-counter">
              {stars}
            </span>
          </div>
        </div>
      </div>

      {/* 进度条：一眼看懂的火车旅程 */}
      <div
        className="relative mt-3 rounded-[24px] border border-white/80 bg-white/60 px-5 pb-4 pt-3 shadow-soft backdrop-blur-sm ipad-land:mt-2 ipad-land:px-5 ipad-land:pb-3 ipad-land:pt-3"
      >
        <div className="flex items-center justify-between gap-3 text-sm font-extrabold sm:text-base">
          <span className="flex items-center gap-1.5 text-sky-700">
            <span aria-hidden="true">🚉</span>
            第 {current} 站
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm text-amber-700">
            {questionsToFinish === 1
              ? `下一站：${currentRoute.destination}`
              : `去${currentRoute.destination} · 还差 ${questionsToFinish} 站`}
          </span>
        </div>

        <div className="relative mt-2 h-14 ipad-land:mt-1">
          <div
            className="absolute inset-x-1 top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-full bg-sky-100 shadow-inner"
            aria-label={`第 ${current} 题，共 ${total} 题，还需完成 ${questionsToFinish} 题`}
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={current}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          <div className="absolute inset-x-1 top-1/2 -translate-y-1/2">
            {Array.from({ length: stationCount }, (_, index) => {
              const stationProgress = (index / (stationCount - 1)) * 100
              const isReached = stationProgress <= progress
              const isCurrent = index === Math.round((progress / 100) * (stationCount - 1))

              return (
                <span
                  key={`station-${index + 1}`}
                  className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm ${
                    isCurrent
                      ? 'z-10 scale-125 bg-coral ring-2 ring-coral/20'
                      : isReached
                        ? 'bg-emerald-400'
                        : 'bg-sky-200'
                  }`}
                  style={{ left: `${stationProgress}%` }}
                  aria-hidden="true"
                />
              )
            })}
          </div>

          <motion.div
            data-testid="practice-train-decoration"
            className="pointer-events-none absolute -top-1 z-20 h-14 w-[70px]"
            initial={false}
            animate={{
              left: `clamp(0px, calc(${progress}% - 35px), calc(100% - 70px))`,
              y: reduceMotion ? 0 : [0, -1.5, 0],
            }}
            transition={{
              left: { duration: 0.5, ease: 'easeOut' },
              y: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' },
            }}
            aria-hidden="true"
          >
            <span className="pointer-events-none absolute bottom-5 left-0 origin-bottom-left scale-[0.62] drop-shadow-md">
              <TrainEngineArt item={selectedTrain} compact running={trainMoving} />
            </span>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
