import { motion } from 'framer-motion'
import { ArrowLeft, Star, Flame } from 'lucide-react'
import { TrainMascot } from '@/components/common/TrainMascot'

interface PracticeHeaderProps {
  current: number // 1-based
  total: number
  stars: number
  streak: number
  onBack: () => void
}

export function PracticeHeader({
  current,
  total,
  stars,
  streak,
  onBack,
}: PracticeHeaderProps) {
  const progress = total <= 1 ? 0 : Math.round(((current - 1) / (total - 1)) * 100)
  const stationCount = Math.min(Math.max(total, 2), 12)
  const questionsToFinish = Math.max(total - current + 1, 1)

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
        className="mt-3 rounded-[22px] border border-white/80 bg-white/60 px-4 pb-3 pt-2.5 shadow-soft backdrop-blur-sm ipad-land:mt-2 ipad-land:px-3 ipad-land:pb-2 ipad-land:pt-2"
        aria-label={`第 ${current} 题，共 ${total} 题，还需完成 ${questionsToFinish} 题`}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <div className="flex items-center justify-between gap-3 text-xs font-extrabold">
          <span className="flex items-center gap-1.5 text-sky-700">
            <span aria-hidden="true">🚉</span>
            第 {current} 站
          </span>
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700 ipad-land:py-0.5">
            {questionsToFinish === 1 ? '下一站就是终点' : `再答 ${questionsToFinish} 题到终点`}
          </span>
        </div>

        <div className="relative mt-2 h-9 ipad-land:mt-1.5 ipad-land:h-8">
          <div className="absolute inset-x-1 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-sky-100 shadow-inner">
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
                  className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm ${
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
            className="absolute -top-0.5 z-20 ipad-land:-top-1"
            initial={false}
            animate={{
              left: `clamp(0px, calc(${progress}% - 17px), calc(100% - 34px))`,
              y: [0, -1.5, 0],
            }}
            transition={{
              left: { duration: 0.5, ease: 'easeOut' },
              y: { duration: 0.45, repeat: Infinity, ease: 'easeInOut' },
            }}
            aria-hidden="true"
          >
            <TrainMascot mood="happy" size={34} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
