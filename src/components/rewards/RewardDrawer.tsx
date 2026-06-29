import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lock, Star, X } from 'lucide-react'
import type { Carriage, CarriageKind, RewardState } from '@/types/rewards'
import { CARRIAGE_CATALOG, getCarriage } from '@/lib/carriages'
import { TrainMascot } from '@/components/common/TrainMascot'

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
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const nextReward = CARRIAGE_CATALOG.find(
    (item) => item.unlockAtStars > reward.stars,
  )
  const selectedHead = getCarriage(reward.selectedHead) ?? CARRIAGE_CATALOG[0]
  const unlockedCars = CARRIAGE_CATALOG.filter(
    (item) =>
      item.kind !== 'head' && reward.unlockedCarriages.includes(item.id),
  )

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
                  答对题目得星星，解锁新车厢
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
                    已解锁 {reward.unlockedCarriages.length}/{CARRIAGE_CATALOG.length}
                  </span>
                </div>

                <div className="relative mt-5 overflow-hidden rounded-[26px] bg-gradient-to-b from-sky-100 via-white/95 to-green-100 ring-1 ring-white/50">
                  <div className="absolute left-6 top-4 h-7 w-16 rounded-full bg-white/75 blur-[1px]" />
                  <div className="absolute right-10 top-7 h-5 w-12 rounded-full bg-white/65" />
                  <div className="absolute inset-x-0 bottom-0 h-9 bg-gradient-to-b from-green-200 to-green-300" />
                  <div className="absolute inset-x-0 bottom-5 h-1.5 bg-slate-500/60" />
                  <div className="absolute inset-x-0 bottom-2 h-1.5 bg-slate-500/60" />
                  <div className="absolute inset-x-0 bottom-1 flex justify-around">
                    {Array.from({ length: 14 }, (_, index) => (
                      <span key={index} className="h-6 w-1 -rotate-12 rounded-full bg-amber-800/35" />
                    ))}
                  </div>

                  <div className="relative overflow-x-auto px-5 pb-8 pt-10">
                    <div className="flex min-w-max items-end gap-0">
                      <EngineArt red={selectedHead.id === 'head-red'} />
                      {unlockedCars.map((item) => (
                        <CarriageArt key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                </div>

                {nextReward ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-bold text-white/85">
                      <span>下一个：{nextReward.emoji} {nextReward.name}</span>
                      <span>还差 {nextReward.unlockAtStars - reward.stars} 颗</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-sky-950/15">
                      <div
                        className="h-full rounded-full bg-amber-300"
                        style={{
                          width: `${Math.min(100, (reward.stars / nextReward.unlockAtStars) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-center text-sm font-bold text-white/90">
                    全部车厢都收集齐啦！
                  </p>
                )}
              </div>

              <h3 className="mb-3 mt-6 text-lg font-extrabold text-slate-700">车厢收藏</h3>
              <div className="grid grid-cols-2 gap-3">
                {CARRIAGE_CATALOG.map((item) => {
                  const unlocked = reward.unlockedCarriages.includes(item.id)
                  const selected = item.id === reward.selectedHead
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={!unlocked || item.kind !== 'head'}
                      onClick={() => item.kind === 'head' && onSelectHead(item.id)}
                      className={[
                        'relative flex min-h-[106px] flex-col items-center justify-center rounded-3xl p-3 text-center transition',
                        unlocked
                          ? 'bg-white shadow-soft ring-1 ring-sky-100'
                          : 'bg-slate-100 text-slate-400 ring-1 ring-slate-200',
                        selected ? 'ring-4 ring-amber-300' : '',
                        unlocked && item.kind === 'head' ? 'hover:-translate-y-0.5' : '',
                      ].join(' ')}
                    >
                      <div className={unlocked ? '' : 'grayscale opacity-35'}>
                        {item.kind === 'head' ? (
                          <EngineArt red={item.id === 'head-red'} compact />
                        ) : (
                          <CarriageArt item={item} compact />
                        )}
                      </div>
                      <span className="mt-2 text-sm font-extrabold text-slate-600">
                        {item.name}
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
        </>
      )}
    </AnimatePresence>
  )
}

const CARRIAGE_COLORS: Record<CarriageKind, string> = {
  head: 'from-sky to-sky-deep',
  number: 'from-amber-300 to-orange-400',
  animal: 'from-grass to-green-500',
  fruit: 'from-coral to-rose-400',
  star: 'from-violet-400 to-indigo-500',
  rainbow: 'from-pink-400 via-amber-300 to-sky',
}

function EngineArt({ red = false, compact = false }: { red?: boolean; compact?: boolean }) {
  if (!red) {
    return (
      <div className={compact ? 'h-[58px] w-[72px] overflow-hidden' : 'relative -mr-2 w-[112px]'}>
        <div className={compact ? 'origin-top-left scale-[0.62]' : ''}>
          <TrainMascot mood="happy" size={compact ? 108 : 112} />
        </div>
      </div>
    )
  }

  return (
    <div className={compact ? 'relative h-[58px] w-[72px]' : 'relative h-[82px] w-[108px]'}>
      <div className={[
        'absolute bottom-3 left-1 flex items-center justify-center rounded-[20px] bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg ring-2 ring-white/50',
        compact ? 'h-11 w-16 text-3xl' : 'h-16 w-24 text-5xl',
      ].join(' ')}>
        🚆
      </div>
      <Wheels compact={compact} />
    </div>
  )
}

function CarriageArt({ item, compact = false }: { item: Carriage; compact?: boolean }) {
  return (
    <div className={compact ? 'relative h-[58px] w-[72px]' : 'relative h-[78px] w-[88px]'}>
      <span className={[
        'absolute -left-2 bottom-7 h-2.5 w-4 rounded-full bg-amber-800/60',
        compact ? 'bottom-6' : '',
      ].join(' ')} />
      <div className={[
        'absolute left-1 flex items-center justify-center rounded-[18px] bg-gradient-to-br text-white shadow-lg ring-2 ring-white/45',
        CARRIAGE_COLORS[item.kind],
        compact ? 'bottom-3 h-11 w-16 text-2xl' : 'bottom-4 h-14 w-20 text-4xl',
      ].join(' ')}>
        {item.emoji}
      </div>
      <Wheels compact={compact} />
    </div>
  )
}

function Wheels({ compact }: { compact: boolean }) {
  return (
    <div className={[
      'absolute bottom-0 left-0 right-0 flex justify-around',
      compact ? 'px-2' : 'px-3',
    ].join(' ')}>
      <span className={compact ? 'h-4 w-4 rounded-full border-[3px] border-slate-700 bg-sky-soft' : 'h-5 w-5 rounded-full border-4 border-slate-700 bg-sky-soft'} />
      <span className={compact ? 'h-4 w-4 rounded-full border-[3px] border-slate-700 bg-sky-soft' : 'h-5 w-5 rounded-full border-4 border-slate-700 bg-sky-soft'} />
    </div>
  )
}
