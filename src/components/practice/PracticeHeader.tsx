import { motion } from 'framer-motion'
import { ArrowLeft, Star, Flame } from 'lucide-react'

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
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-soft transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/50"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="rounded-full bg-white/80 px-4 py-1.5 text-base font-bold text-slate-600 shadow-soft">
          第 {current} / {total} 题
        </div>

        <div className="flex items-center gap-2">
          {streak >= 2 && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1.5 text-coral shadow-soft"
            >
              <Flame size={18} fill="currentColor" />
              <span className="text-sm font-extrabold">{streak}</span>
            </motion.div>
          )}
          <div className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-amber-500 shadow-soft">
            <Star size={20} fill="currentColor" />
            <span className="font-extrabold" id="star-counter">
              {stars}
            </span>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/60">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sky to-grass"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  )
}
