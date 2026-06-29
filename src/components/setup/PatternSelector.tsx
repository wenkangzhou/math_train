import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { QuestionPattern } from '@/types/math'

interface PatternOption {
  value: QuestionPattern
  example: string
  op: 'add' | 'sub'
}

const ADD_OPTIONS: PatternOption[] = [
  { value: 'a-plus-b-equals-blank', example: '3 + 2 = ?', op: 'add' },
  { value: 'a-plus-blank-equals-c', example: '3 + ? = 5', op: 'add' },
  { value: 'blank-plus-b-equals-c', example: '? + 2 = 5', op: 'add' },
]

const SUB_OPTIONS: PatternOption[] = [
  { value: 'a-minus-b-equals-blank', example: '5 - 2 = ?', op: 'sub' },
  { value: 'a-minus-blank-equals-c', example: '5 - ? = 3', op: 'sub' },
  { value: 'blank-minus-b-equals-c', example: '? - 2 = 3', op: 'sub' },
]

interface PatternSelectorProps {
  selected: QuestionPattern[]
  additionEnabled: boolean
  subtractionEnabled: boolean
  onToggle: (value: QuestionPattern) => void
}

function PatternGroup({
  label,
  options,
  enabled,
  selected,
  onToggle,
  accent,
}: {
  label: string
  options: PatternOption[]
  enabled: boolean
  selected: QuestionPattern[]
  onToggle: (v: QuestionPattern) => void
  accent: string
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-500">{label}</h3>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {options.map((opt) => {
          const active = enabled && selected.includes(opt.value)
          return (
            <motion.button
              key={opt.value}
              type="button"
              disabled={!enabled}
              whileTap={enabled ? { scale: 0.93 } : undefined}
              onClick={() => enabled && onToggle(opt.value)}
              aria-pressed={active}
              aria-label={opt.example}
              className={[
                'relative flex min-h-[52px] items-center justify-center rounded-btn px-1 py-2 transition ipad-land:min-h-[44px] ipad-land:py-1.5',
                'focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/50',
                !enabled
                  ? 'cursor-not-allowed bg-slate-100 opacity-40'
                  : active
                    ? `${accent} ring-4 shadow-soft`
                    : 'bg-slate-50 ring-2 ring-slate-200 hover:bg-slate-100',
              ].join(' ')}
            >
              <span className="font-digit text-lg text-slate-700 sm:text-xl ipad-land:text-base">
                {opt.example}
              </span>
              {active && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-grass text-white">
                  <Check size={13} strokeWidth={3} />
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export function PatternSelector({
  selected,
  additionEnabled,
  subtractionEnabled,
  onToggle,
}: PatternSelectorProps) {
  return (
    <div className="space-y-4">
      <PatternGroup
        label="加法题型"
        options={ADD_OPTIONS}
        enabled={additionEnabled}
        selected={selected}
        onToggle={onToggle}
        accent="bg-sky-soft ring-sky"
      />
      <PatternGroup
        label="减法题型"
        options={SUB_OPTIONS}
        enabled={subtractionEnabled}
        selected={selected}
        onToggle={onToggle}
        accent="bg-orange-100 ring-coral"
      />
    </div>
  )
}
