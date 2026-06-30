import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Lock, Play, Star, X } from 'lucide-react'
import type { Carriage, RewardState, TrainLivery } from '@/types/rewards'
import { CARRIAGE_CATALOG, getCarriage } from '@/lib/carriages'

interface RewardDrawerProps {
  open: boolean
  reward: RewardState
  onClose: () => void
  onSelectHead: (id: string) => void
}

export function RewardDrawer({
  open,
  reward,
  onClose,
  onSelectHead,
}: RewardDrawerProps) {
  const reduceMotion = useReducedMotion()
  const [focusedId, setFocusedId] = useState(reward.selectedHead)
  const [runCycle, setRunCycle] = useState(0)
  const [running, setRunning] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (detailOpen) {
        setDetailOpen(false)
        setFocusedId(reward.selectedHead)
        setRunning(false)
      } else {
        onClose()
      }
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [detailOpen, open, onClose, reward.selectedHead])

  useEffect(() => {
    if (!open) return
    setFocusedId(reward.selectedHead)
    setRunning(false)
    setDetailOpen(false)
  }, [open, reward.selectedHead])

  const nextReward = CARRIAGE_CATALOG.find(
    (item) => item.unlockAtStars > reward.stars,
  )
  const selectedHead = getCarriage(reward.selectedHead) ?? CARRIAGE_CATALOG[0]
  const focusedTrain = getCarriage(focusedId) ?? selectedHead
  const focusedUnlocked = reward.unlockedCarriages.includes(focusedTrain.id)
  const currentMilestone = [...CARRIAGE_CATALOG]
    .reverse()
    .find((item) => item.unlockAtStars <= reward.stars)?.unlockAtStars ?? 0
  const milestoneProgress = nextReward
    ? Math.min(
        100,
        ((reward.stars - currentMilestone) /
          (nextReward.unlockAtStars - currentMilestone)) * 100,
      )
    : 100

  const runFocusedTrain = () => {
    if (running) return
    setRunCycle((cycle) => cycle + 1)
    setRunning(true)
  }

  const closeTrainDetail = () => {
    setDetailOpen(false)
    setFocusedId(selectedHead.id)
    setRunning(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="关闭我的小火车"
            className="fixed inset-0 z-40 cursor-default bg-slate-900/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reward-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[88dvh] flex-col rounded-t-[32px] bg-[#f5fbff] shadow-2xl ipad-land:bottom-0 ipad-land:left-auto ipad-land:right-0 ipad-land:top-0 ipad-land:h-full ipad-land:w-[480px] ipad-land:rounded-l-[32px] ipad-land:rounded-tr-none"
          >
            <header className="flex items-center justify-between border-b border-sky-100 px-5 py-4 sm:px-6">
              <div>
                <h2 id="reward-title" className="text-2xl font-extrabold text-slate-700">
                  我的小火车
                </h2>
                <p className="mt-0.5 text-sm font-medium text-slate-400">
                  答题攒星，解锁不同颜色和功能的机车
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200"
              >
                <X size={22} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="rounded-[28px] bg-gradient-to-br from-sky-deep via-sky to-cyan-300 p-5 text-white shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-lg font-extrabold">
                    <Star size={22} fill="currentColor" className="text-amber-300" />
                    {reward.stars} 颗星星
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                    已解锁 {reward.unlockedCarriages.length}/{CARRIAGE_CATALOG.length} 辆
                  </span>
                </div>

                <div className="relative mt-5 h-44 overflow-hidden rounded-[26px] bg-gradient-to-b from-sky-100 via-white/95 to-green-100 ring-1 ring-white/50">
                  <div className="absolute left-6 top-4 h-7 w-16 rounded-full bg-white/75 blur-[1px]" />
                  <div className="absolute right-10 top-7 h-5 w-12 rounded-full bg-white/65" />
                  <div className="absolute left-4 top-3 z-20 rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold text-slate-600 shadow-sm">
                    {focusedTrain.name} · {focusedTrain.functionLabel}
                  </div>
                  <button
                    type="button"
                    data-testid="run-main-train"
                    onClick={runFocusedTrain}
                    disabled={running}
                    className="absolute right-3 top-3 z-30 flex items-center gap-1.5 rounded-full bg-coral px-3 py-2 text-xs font-extrabold text-white shadow-md transition disabled:bg-slate-400"
                  >
                    <Play size={14} fill="currentColor" />
                    {running ? '正在跑…' : '跑一圈'}
                  </button>
                  <div className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-b from-green-200 to-green-300" />
                  <div className="absolute inset-x-0 bottom-5 h-1.5 bg-slate-500/60" />
                  <div className="absolute inset-x-0 bottom-2 h-1.5 bg-slate-500/60" />
                  <div className="absolute inset-x-0 bottom-1 flex justify-around">
                    {Array.from({ length: 14 }, (_, index) => (
                      <span key={index} className="h-6 w-1 -rotate-12 rounded-full bg-amber-800/35" />
                    ))}
                  </div>

                  <motion.div
                    key={`${focusedTrain.id}-${runCycle}`}
                    data-testid="train-stage-runner"
                    className="absolute bottom-6 left-6 z-10"
                    initial={false}
                    animate={
                      running
                        ? { x: reduceMotion ? [0, 16, 0] : [0, 160, 0] }
                        : { x: 0 }
                    }
                    transition={{
                      duration: reduceMotion ? 0.5 : 2.8,
                      ease: 'easeInOut',
                    }}
                    onAnimationComplete={() => {
                      if (running) setRunning(false)
                    }}
                  >
                    <EngineArt item={focusedTrain} running={running && !reduceMotion} />
                  </motion.div>
                </div>

                {nextReward ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-bold text-white/85">
                      <span>下一个：{nextReward.name} · {nextReward.functionLabel}</span>
                      <span>还差 {nextReward.unlockAtStars - reward.stars} 颗</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-sky-950/15">
                      <div
                        className="h-full rounded-full bg-amber-300"
                        style={{ width: `${milestoneProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-center text-sm font-bold text-white/90">
                    全部机车都收集齐啦！
                  </p>
                )}
              </div>

              <div className="mb-3 mt-6 flex items-end justify-between gap-3">
                <h3 className="text-lg font-extrabold text-slate-700">机车车库</h3>
                <span className="text-xs font-bold text-slate-400">点任意机车查看档案</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CARRIAGE_CATALOG.map((item) => {
                  const unlocked = reward.unlockedCarriages.includes(item.id)
                  const selected = item.id === reward.selectedHead
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={focusedTrain.id === item.id}
                      onClick={() => {
                        setFocusedId(item.id)
                        setRunning(false)
                        setDetailOpen(true)
                      }}
                      className={[
                        'relative flex min-h-[142px] flex-col items-center justify-center rounded-3xl p-3 text-center transition',
                        unlocked
                          ? 'bg-white shadow-soft ring-1 ring-sky-100'
                          : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200',
                        focusedTrain.id === item.id ? 'ring-4 ring-sky-300' : '',
                      ].join(' ')}
                    >
                      <div className={unlocked ? '' : 'opacity-[0.55] saturate-[0.75]'}>
                        <EngineArt item={item} compact />
                      </div>
                      <span className="mt-1 text-sm font-extrabold text-slate-700">
                        {item.name}
                      </span>
                      <span className="mt-0.5 text-[11px] font-bold text-slate-400">
                        {item.emoji} {item.functionLabel}
                      </span>
                      {!unlocked && (
                        <span className="mt-1 flex items-center gap-1 text-xs font-bold">
                          <Lock size={12} /> {item.unlockAtStars} 星
                        </span>
                      )}
                      {selected && (
                        <span className="absolute right-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-white">
                          使用中
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.section>

          <AnimatePresence>
            {detailOpen && (
              <>
                <motion.button
                  type="button"
                  aria-label="关闭机车档案"
                  className="fixed inset-0 z-[55] cursor-default bg-slate-900/45 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={closeTrainDetail}
                />
                <motion.section
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="train-detail-title"
                  initial={{ opacity: 0, scale: 0.92, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 12 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 260 }}
                  className="fixed inset-x-4 bottom-4 z-[60] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[30px] bg-white p-5 shadow-2xl ipad-land:bottom-auto ipad-land:left-auto ipad-land:right-5 ipad-land:top-[7dvh] ipad-land:max-h-[86dvh] ipad-land:w-[440px]"
                >
                  <header className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-extrabold text-sky-deep">机车档案</span>
                      <h3 id="train-detail-title" className="mt-0.5 text-2xl font-extrabold text-slate-700">
                        {focusedTrain.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={closeTrainDetail}
                      aria-label="关闭档案"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                    >
                      <X size={20} />
                    </button>
                  </header>

                  <div className="relative mt-4 h-40 overflow-hidden rounded-[24px] bg-gradient-to-b from-sky-100 via-white to-green-100 ring-1 ring-sky-100">
                    <div className="absolute left-5 top-4 h-6 w-14 rounded-full bg-white/80" />
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-green-200" />
                    <div className="absolute inset-x-0 bottom-4 h-1.5 bg-slate-500/60" />
                    <div className="absolute inset-x-0 bottom-1 h-1.5 bg-slate-500/60" />
                    <motion.div
                      key={`detail-${focusedTrain.id}-${runCycle}`}
                      data-testid="train-detail-runner"
                      className="absolute bottom-5 left-6"
                      initial={false}
                      animate={
                        running
                          ? { x: reduceMotion ? [0, 12, 0] : [0, 150, 0] }
                          : { x: 0 }
                      }
                      transition={{ duration: reduceMotion ? 0.5 : 2.8, ease: 'easeInOut' }}
                      onAnimationComplete={() => {
                        if (running) setRunning(false)
                      }}
                    >
                      <EngineArt item={focusedTrain} running={running && !reduceMotion} />
                    </motion.div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <TrainFact label="工作" value={`${focusedTrain.emoji} ${focusedTrain.functionLabel}`} />
                    <TrainFact label="性格" value={focusedTrain.personality} />
                  </div>
                  <p className="mt-3 rounded-2xl bg-sky-50 p-3 text-sm font-medium leading-6 text-slate-600">
                    {focusedTrain.description}
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      data-testid="run-detail-train"
                      onClick={runFocusedTrain}
                      disabled={running}
                      className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-coral px-4 text-sm font-extrabold text-white shadow-soft disabled:bg-slate-300"
                    >
                      <Play size={18} fill="currentColor" />
                      {running ? '奔跑中…' : '试跑一次'}
                    </button>
                    {focusedUnlocked ? (
                      focusedTrain.id === selectedHead.id ? (
                        <span className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-amber-100 px-4 text-sm font-extrabold text-amber-700">
                          <CheckCircle2 size={18} /> 正在使用
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectHead(focusedTrain.id)}
                          className="min-h-12 flex-1 rounded-full bg-grass px-4 text-sm font-extrabold text-white shadow-soft"
                        >
                          设为出发机车
                        </button>
                      )
                    ) : (
                      <span className="flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-slate-100 px-3 text-sm font-extrabold text-slate-500">
                        <Lock size={16} /> {Math.max(0, focusedTrain.unlockAtStars - reward.stars)} 星后解锁
                      </span>
                    )}
                  </div>
                </motion.section>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}

function TrainFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
      <span className="block text-[11px] font-bold text-slate-400">{label}</span>
      <span className="mt-0.5 block text-sm font-extrabold text-slate-700">{value}</span>
    </div>
  )
}

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

function EngineArt({
  item,
  compact = false,
  running = false,
}: {
  item: Carriage
  compact?: boolean
  running?: boolean
}) {
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
