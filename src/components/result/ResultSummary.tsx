import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import type { PracticeResult } from '@/types/math'

interface ResultSummaryProps {
  result: PracticeResult
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white/80 px-3 py-3 shadow-soft">
      <span className={`text-2xl font-extrabold ${accent}`}>{value}</span>
      <span className="mt-0.5 text-xs font-medium text-slate-500">{label}</span>
    </div>
  )
}

export function ResultSummary({ result }: ResultSummaryProps) {
  const accuracyPct = Math.round(result.accuracy * 100)

  return (
    <div className="w-full space-y-4">
      {/* 星星 */}
      <div className="flex items-center justify-center gap-2 text-amber-500">
        {Array.from({ length: Math.min(result.stars, 10) }, (_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 260 }}
          >
            <Star size={28} fill="currentColor" />
          </motion.span>
        ))}
        {result.stars > 10 && (
          <span className="text-xl font-extrabold">+{result.stars - 10}</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill
          label="答对题数"
          value={`${result.correctCount}/${result.total}`}
          accent="text-grass"
        />
        <StatPill label="正确率" value={`${accuracyPct}%`} accent="text-sky-deep" />
        <StatPill
          label="最长连对"
          value={`${result.bestStreak}`}
          accent="text-coral"
        />
        <StatPill
          label="使用提示"
          value={`${result.hintsUsed}`}
          accent="text-amber-500"
        />
      </div>
    </div>
  )
}
