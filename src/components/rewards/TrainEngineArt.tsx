import { motion } from 'framer-motion'
import type { Carriage, TrainLivery } from '@/types/rewards'

interface EnginePalette {
  body: string
  dark: string
  accent: string
  light: string
}

const ENGINE_PALETTES: Record<TrainLivery, EnginePalette> = {
  blue: { body: 'bg-sky-500', dark: 'bg-sky-700', accent: 'bg-red-500', light: 'bg-sky-200' },
  red: { body: 'bg-red-500', dark: 'bg-red-700', accent: 'bg-amber-300', light: 'bg-red-200' },
  green: { body: 'bg-emerald-500', dark: 'bg-emerald-700', accent: 'bg-amber-400', light: 'bg-emerald-200' },
  yellow: { body: 'bg-amber-400', dark: 'bg-amber-600', accent: 'bg-red-500', light: 'bg-amber-100' },
  orange: { body: 'bg-orange-500', dark: 'bg-orange-700', accent: 'bg-sky-400', light: 'bg-orange-200' },
  navy: { body: 'bg-blue-700', dark: 'bg-blue-950', accent: 'bg-cyan-300', light: 'bg-blue-200' },
  purple: { body: 'bg-violet-500', dark: 'bg-violet-800', accent: 'bg-fuchsia-300', light: 'bg-violet-200' },
  cyan: { body: 'bg-cyan-400', dark: 'bg-cyan-700', accent: 'bg-white', light: 'bg-cyan-100' },
  teal: { body: 'bg-teal-500', dark: 'bg-teal-800', accent: 'bg-amber-300', light: 'bg-teal-100' },
  pink: { body: 'bg-pink-500', dark: 'bg-pink-700', accent: 'bg-yellow-300', light: 'bg-pink-100' },
  slate: { body: 'bg-slate-500', dark: 'bg-slate-800', accent: 'bg-orange-400', light: 'bg-slate-200' },
  lime: { body: 'bg-lime-500', dark: 'bg-lime-700', accent: 'bg-cyan-300', light: 'bg-lime-100' },
  rose: { body: 'bg-rose-400', dark: 'bg-rose-700', accent: 'bg-amber-300', light: 'bg-rose-100' },
  indigo: { body: 'bg-indigo-500', dark: 'bg-indigo-900', accent: 'bg-fuchsia-300', light: 'bg-indigo-200' },
}

const SMOKE_PUFFS = ['smoke-a', 'smoke-b', 'smoke-c'] as const
const WHEEL_IDS = ['front', 'middle', 'back'] as const

interface TrainEngineArtProps {
  item: Carriage
  compact?: boolean
  running?: boolean
}

export function TrainEngineArt({
  item,
  compact = false,
  running = false,
}: TrainEngineArtProps) {
  const palette = ENGINE_PALETTES[item.livery]
  return (
    <div
      className={compact ? 'relative h-[72px] w-[102px]' : 'relative h-[92px] w-[132px]'}
      aria-hidden="true"
    >
      {running && !compact && (
        <span data-testid="train-smoke" className="absolute bottom-[78px] left-[88px] z-20">
          {SMOKE_PUFFS.map((puff, index) => (
            <motion.i
              key={puff}
              className="absolute h-4 w-4 rounded-full bg-white/80 shadow-sm"
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: [0, 0.9, 0], x: [0, 8, 18], y: [0, -12, -26], scale: [0.6, 1, 1.5] }}
              transition={{ duration: 1.25, repeat: Infinity, delay: index * 0.36 }}
            />
          ))}
        </span>
      )}
      <span className={[
        'absolute rounded-t-md shadow-sm', palette.dark,
        compact ? 'bottom-[48px] left-[65px] h-6 w-3' : 'bottom-[60px] left-[84px] h-8 w-4',
      ].join(' ')} />
      <span className={[
        'absolute rounded-full ring-2 ring-white/50', palette.accent,
        compact ? 'bottom-[45px] left-[47px] h-3 w-4' : 'bottom-[56px] left-[61px] h-4 w-5',
      ].join(' ')} />

      <div className={[
        'absolute rounded-t-[16px] shadow-md ring-2 ring-white/35', palette.body,
        compact ? 'bottom-[18px] left-1 h-10 w-8' : 'bottom-[22px] left-1 h-14 w-11',
      ].join(' ')}>
        <span className={[
          'absolute rounded-md border-2 border-white/80 bg-sky-100',
          compact ? 'left-2 top-2 h-4 w-4' : 'left-2.5 top-2.5 h-5 w-5',
        ].join(' ')} />
      </div>

      <div className={[
        'absolute rounded-[18px] shadow-md ring-2 ring-white/35', palette.body,
        compact ? 'bottom-[18px] left-[29px] h-8 w-[61px]' : 'bottom-[22px] left-[40px] h-11 w-[78px]',
      ].join(' ')}>
        <span className={[
          'absolute left-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/90 font-bold shadow-sm',
          compact ? 'h-5 w-5 text-[10px]' : 'h-7 w-7 text-sm',
        ].join(' ')}>
          {item.emoji}
        </span>
        <span className={[
          'absolute bottom-1 right-2 rounded-full', palette.accent,
          compact ? 'h-1.5 w-6' : 'h-2 w-8',
        ].join(' ')} />
      </div>

      <div className={[
        'absolute flex items-center justify-center rounded-full bg-[#f7e7d0] shadow-md ring-2 ring-slate-300',
        compact ? 'bottom-[22px] right-0 h-7 w-7' : 'bottom-[28px] right-0 h-9 w-9',
      ].join(' ')}>
        <span className={compact ? 'mb-1 flex gap-1' : 'mb-1 flex gap-1.5'}>
          <i className="h-1.5 w-1.5 rounded-full bg-slate-700" />
          <i className="h-1.5 w-1.5 rounded-full bg-slate-700" />
        </span>
        <span className="absolute bottom-1.5 h-1 w-3 rounded-full border-b-2 border-slate-500" />
      </div>

      <span className={[
        'absolute left-0 right-1 rounded-full shadow-sm', palette.dark,
        compact ? 'bottom-[14px] h-2' : 'bottom-[17px] h-2.5',
      ].join(' ')} />
      <span className={[
        'absolute right-0 border-y-transparent border-l-transparent',
        compact
          ? 'bottom-[14px] border-b-[8px] border-r-[13px] border-t-[8px] border-r-slate-600'
          : 'bottom-[17px] border-b-[10px] border-r-[16px] border-t-[10px] border-r-slate-600',
      ].join(' ')} />
      <EngineWheels compact={compact} palette={palette} running={running} />
    </div>
  )
}

function EngineWheels({
  compact,
  palette,
  running,
}: {
  compact: boolean
  palette: EnginePalette
  running: boolean
}) {
  return (
    <div className={compact ? 'absolute bottom-0 left-2 right-3 flex justify-between' : 'absolute bottom-0 left-3 right-4 flex justify-between'}>
      {WHEEL_IDS.map((wheel) => (
        <motion.span
          key={wheel}
          animate={running ? { rotate: 360 } : { rotate: 0 }}
          transition={running ? { duration: 0.42, repeat: Infinity, ease: 'linear' } : undefined}
          className={[
            'flex items-center justify-center rounded-full border-slate-700 shadow-sm ring-1 ring-white/70',
            palette.light,
            compact ? 'h-5 w-5 border-[4px]' : 'h-7 w-7 border-[5px]',
          ].join(' ')}
        >
          <i className="block h-1.5 w-1.5 rounded-full bg-slate-700/70" />
        </motion.span>
      ))}
    </div>
  )
}
