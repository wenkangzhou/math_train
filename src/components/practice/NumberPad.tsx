import { motion } from 'framer-motion'
import { Delete, Check } from 'lucide-react'

interface NumberPadProps {
  max: number
  entered: number | null
  disabled?: boolean
  onPick: (n: number) => void
  onClear: () => void
  onConfirm: () => void
}

export function NumberPad({
  max,
  entered,
  disabled = false,
  onPick,
  onClear,
  onConfirm,
}: NumberPadProps) {
  const numbers = Array.from({ length: max + 1 }, (_, i) => i)
  // 0~10 使用四列，优先保证儿童触控面积；0~20 使用七列控制总高度。
  const cols = max <= 10 ? 'grid-cols-4' : 'grid-cols-7'

  return (
    <div className="w-full">
      <div className={`grid ${cols} gap-2.5 sm:gap-3`}>
        {numbers.map((n) => {
          const active = entered === n
          return (
            <motion.button
              key={n}
              type="button"
              disabled={disabled}
              whileTap={disabled ? undefined : { scale: 0.9 }}
              onClick={() => onPick(n)}
              aria-label={`数字 ${n}`}
              className={[
                'flex aspect-[1.15] min-h-[60px] items-center justify-center rounded-2xl text-2xl font-extrabold transition sm:text-3xl md:min-h-[68px] md:text-4xl ipad-land:min-h-[66px] ipad-land:rounded-[20px] ipad-land:text-3xl',
                'focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/60',
                active
                  ? 'bg-sky text-white shadow-soft ring-4 ring-sky-deep'
                  : 'bg-white text-slate-700 shadow-pop ring-1 ring-slate-200 hover:bg-sky-soft/40',
                disabled ? 'opacity-50' : '',
              ].join(' ')}
            >
              {n}
            </motion.button>
          )
        })}
      </div>

      <div className="mt-3 flex gap-3 md:mt-4 ipad-land:mt-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={onClear}
          disabled={disabled || entered === null}
          aria-label="清除"
          className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-slate-100 py-4 text-lg font-bold text-slate-500 ring-2 ring-slate-200 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300 disabled:opacity-40 md:py-6 md:text-2xl ipad-land:py-3 ipad-land:text-base"
        >
          <Delete size={22} className="ipad-land:h-5 ipad-land:w-5" /> 清除
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={onConfirm}
          disabled={disabled || entered === null}
          className="flex min-h-14 flex-[2] items-center justify-center gap-2 rounded-full bg-grass py-4 text-xl font-extrabold text-white shadow-soft transition hover:-translate-y-0.5 hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-grass/60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 md:py-6 md:text-3xl ipad-land:py-3.5 ipad-land:text-lg"
        >
          <Check size={24} strokeWidth={3} /> 确定
        </motion.button>
      </div>
    </div>
  )
}
