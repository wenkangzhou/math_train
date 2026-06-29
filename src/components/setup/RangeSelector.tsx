import { motion } from 'framer-motion'
import { Check, Plus, Minus } from 'lucide-react'
import type { RangeType } from '@/types/math'

interface RangeOption {
  value: RangeType
  label: string
  op: 'add' | 'sub'
  ring: string
  bg: string
}

const RANGE_OPTIONS: RangeOption[] = [
  {
    value: 'addition-within-10',
    label: '10 以内加法',
    op: 'add',
    ring: 'ring-sky',
    bg: 'bg-sky-soft',
  },
  {
    value: 'subtraction-within-10',
    label: '10 以内减法',
    op: 'sub',
    ring: 'ring-coral',
    bg: 'bg-orange-100',
  },
  {
    value: 'addition-within-20',
    label: '20 以内加法',
    op: 'add',
    ring: 'ring-grass',
    bg: 'bg-green-100',
  },
  {
    value: 'subtraction-within-20',
    label: '20 以内减法',
    op: 'sub',
    ring: 'ring-candy',
    bg: 'bg-pink-100',
  },
]

interface RangeSelectorProps {
  selected: RangeType[]
  onToggle: (value: RangeType) => void
}

export function RangeSelector({ selected, onToggle }: RangeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {RANGE_OPTIONS.map((opt) => {
        const active = selected.includes(opt.value)
        return (
          <motion.button
            key={opt.value}
            type="button"
            whileTap={{ scale: 0.94 }}
            whileHover={{ y: -2 }}
            onClick={() => onToggle(opt.value)}
            aria-pressed={active}
            className={[
              'relative flex min-h-[64px] items-center gap-3 rounded-btn p-3.5 text-left transition ipad-land:min-h-[52px] ipad-land:p-2.5',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/60',
              active
                ? `${opt.bg} ring-4 ${opt.ring} shadow-soft`
                : 'bg-slate-50 ring-2 ring-slate-200 hover:bg-slate-100',
            ].join(' ')}
          >
            <span
              className={[
                'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ipad-land:h-10 ipad-land:w-10',
                opt.op === 'add' ? 'bg-sky' : 'bg-coral',
              ].join(' ')}
            >
              {opt.op === 'add' ? <Plus size={26} className="ipad-land:h-5 ipad-land:w-5" /> : <Minus size={26} className="ipad-land:h-5 ipad-land:w-5" />}
            </span>
            <span className="text-lg font-bold text-slate-700 ipad-land:text-base">{opt.label}</span>
            {active && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-grass text-white shadow"
              >
                <Check size={16} strokeWidth={3} />
              </motion.span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
