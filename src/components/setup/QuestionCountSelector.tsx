import { motion } from 'framer-motion'
import type { QuestionCount } from '@/types/math'

const COUNTS: QuestionCount[] = [5, 10, 20]

interface QuestionCountSelectorProps {
  value: QuestionCount
  onChange: (value: QuestionCount) => void
}

export function QuestionCountSelector({
  value,
  onChange,
}: QuestionCountSelectorProps) {
  return (
    <div className="flex gap-3 sm:gap-4">
      {COUNTS.map((count) => {
        const active = value === count
        return (
          <motion.button
            key={count}
            type="button"
            whileTap={{ scale: 0.93 }}
            onClick={() => onChange(count)}
            aria-pressed={active}
            className={[
              'flex-1 rounded-full py-4 text-2xl font-extrabold transition',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/60',
              active
                ? 'bg-sky text-white shadow-soft'
                : 'bg-slate-50 text-slate-500 ring-2 ring-slate-200 hover:bg-slate-100',
            ].join(' ')}
          >
            {count}
            <span className="ml-1 text-base font-bold">题</span>
          </motion.button>
        )
      })}
    </div>
  )
}
