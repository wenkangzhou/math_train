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
  const progress = Math.round(((current - 1) / total) * 100)

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

      {/* 进度条：小火车轨道 */}
      <div className="relative mt-4 h-9 w-full">
        {/* 枕木 */}
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-1">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="h-5 w-1.5 rounded-sm bg-amber-800/20"
            />
          ))}
        </div>

        {/* 上下铁轨 */}
        <div className="absolute inset-x-0 top-[calc(50%-5px)] h-1 rounded-full bg-amber-800/30" />
        <div className="absolute inset-x-0 top-[calc(50%+4px)] h-1 rounded-full bg-amber-800/30" />

        {/* 已行驶轨道 */}
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full">
          <motion.div
            className="h-full bg-gradient-to-r from-sky via-sky-300 to-grass"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* 行驶的小火车 */}
        <motion.div
          className="absolute -top-1 z-10"
          initial={false}
          animate={{
            left: `clamp(0px, calc(${progress}% - 18px), calc(100% - 36px))`,
            y: [0, -2, 0],
          }}
          transition={{
            left: { duration: 0.5, ease: 'easeOut' },
            y: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' },
          }}
          aria-hidden="true"
        >
          <TrainMascot mood="happy" size={36} />
        </motion.div>
      </div>
    </div>
  )
}
