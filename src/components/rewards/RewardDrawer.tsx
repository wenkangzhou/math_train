import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BellRing, CheckCircle2, Lock, MapPin, Play, Star, X } from 'lucide-react'
import type { Carriage, RewardState, TrainRoute } from '@/types/rewards'
import { CARRIAGE_CATALOG, getCarriage } from '@/lib/carriages'
import { TRAIN_ROUTES, getTrainRoute, routeStampId } from '@/lib/trainRoutes'
import { estimateTripsRemaining } from '@/lib/starWeights'
import { playTrainBell } from '@/lib/sound'
import { TrainEngineArt } from './TrainEngineArt'

interface RewardDrawerProps {
  open: boolean
  reward: RewardState
  soundEnabled: boolean
  estimatedStarsPerTrip: number
  onClose: () => void
  onSelectHead: (id: string) => void
}

const JOURNEY_DURATION_SECONDS = 9
const RETURN_BELL_MS = 8200
const JOURNEY_STOP_MS = 9300

export function RewardDrawer({
  open,
  reward,
  soundEnabled,
  estimatedStarsPerTrip,
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
    if (!open) {
      setRunning(false)
      setDetailOpen(false)
      return
    }
    setFocusedId(reward.selectedHead)
    setRunning(false)
    setDetailOpen(false)
  }, [open, reward.selectedHead])

  useEffect(() => {
    if (!running) return
    const returnBell = window.setTimeout(
      () => {
        if (soundEnabled) playTrainBell()
      },
      reduceMotion ? 500 : RETURN_BELL_MS,
    )
    const stopTimer = window.setTimeout(
      () => setRunning(false),
      reduceMotion ? 850 : JOURNEY_STOP_MS,
    )
    return () => {
      window.clearTimeout(returnBell)
      window.clearTimeout(stopTimer)
    }
  }, [reduceMotion, running, soundEnabled])

  const nextReward = CARRIAGE_CATALOG.find(
    (item) => item.unlockAtStars > reward.stars,
  )
  const selectedHead = getCarriage(reward.selectedHead) ?? CARRIAGE_CATALOG[0]
  const focusedTrain = getCarriage(focusedId) ?? selectedHead
  const focusedRoute = getTrainRoute(focusedTrain.id)
  const focusedUnlocked = reward.unlockedCarriages.includes(focusedTrain.id)
  const earnedRouteCount = TRAIN_ROUTES.filter((route) =>
    reward.stickers.includes(routeStampId(route.id)),
  ).length
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
  const starsRemaining = nextReward
    ? Math.max(0, nextReward.unlockAtStars - reward.stars)
    : 0
  const estimatedTripsRemaining = nextReward
    ? estimateTripsRemaining(starsRemaining, estimatedStarsPerTrip)
    : 0

  const runFocusedTrain = () => {
    if (running) return
    if (soundEnabled) playTrainBell()
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
                  每趟先拿邮票，星星用来解锁新机车
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
                    {running ? '长途旅行中…' : '长途出发'}
                  </button>
                  <TrainJourneyScene
                    key={`${focusedTrain.id}-${runCycle}`}
                    item={focusedTrain}
                    route={focusedRoute}
                    running={running}
                    reduceMotion={Boolean(reduceMotion)}
                  />
                </div>
                <p className="mt-2 text-center text-xs font-extrabold text-white/90">
                  🚉 出站 → 🐄 牧场 → 🌉 河桥 → 🏘️ 小镇 → 🚉 回原站
                </p>

                {nextReward ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-bold text-white/85">
                      <span>下一个：{nextReward.name} · {nextReward.functionLabel}</span>
                      <span className="text-right">
                        还差 {starsRemaining} 颗 · 约再跑 {estimatedTripsRemaining} 趟
                      </span>
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
                <div>
                  <h3 className="text-lg font-extrabold text-slate-700">路线邮册</h3>
                  <p className="text-xs font-bold text-slate-400">每辆机车都有一条专属任务路线</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-700">
                  {earnedRouteCount}/{TRAIN_ROUTES.length} 枚
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {TRAIN_ROUTES.map((route) => {
                  const earned = reward.stickers.includes(routeStampId(route.id))
                  const trips = reward.routeTrips?.[route.id] ?? 0
                  return (
                    <div
                      key={route.id}
                      title={earned ? `${route.destination}，已到站 ${trips} 次` : `完成${route.destination}路线后获得`}
                      aria-label={earned ? `${route.destination}邮票，已到站${trips}次` : `${route.destination}邮票尚未获得`}
                      className={[
                        'flex min-h-[84px] flex-col items-center justify-center rounded-2xl px-1.5 py-2 text-center ring-1',
                        earned
                          ? 'bg-gradient-to-b from-amber-50 to-white text-slate-700 shadow-sm ring-amber-200'
                          : 'bg-slate-100 text-slate-400 ring-slate-200',
                      ].join(' ')}
                    >
                      <span className={earned ? 'text-3xl' : 'grayscale text-3xl opacity-35'} aria-hidden="true">
                        {route.stampEmoji}
                      </span>
                      <span className="mt-1 max-w-full truncate text-xs font-extrabold">
                        {route.destination}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {earned ? `到站 ${trips} 次` : '等待出发'}
                      </span>
                    </div>
                  )
                })}
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
                        <TrainEngineArt item={item} compact />
                      </div>
                      <span className="mt-1 text-sm font-extrabold text-slate-700">
                        {item.name}
                      </span>
                      <span className="mt-0.5 text-xs font-bold text-slate-400">
                        {item.emoji} {item.functionLabel}
                      </span>
                      {!unlocked && (
                        <span className="mt-1 flex items-center gap-1 text-xs font-bold">
                          <Lock size={12} /> {item.unlockAtStars} 星
                        </span>
                      )}
                      {selected && (
                        <span className="absolute right-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold text-white">
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
                    <TrainJourneyScene
                      key={`detail-${focusedTrain.id}-${runCycle}`}
                      item={focusedTrain}
                      route={focusedRoute}
                      running={running}
                      reduceMotion={Boolean(reduceMotion)}
                      compact
                    />
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
                      {running ? '长途旅行中…' : '让它跑一趟'}
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
      <span className="block text-xs font-bold text-slate-400">{label}</span>
      <span className="mt-0.5 block text-sm font-extrabold text-slate-700">{value}</span>
    </div>
  )
}

// Railroad ties evenly spaced across one tile; they scroll with the scenery
// so the wheels look like they're actually covering ground.
const SLEEPER_OFFSETS = [3, 14, 25, 36, 47, 58, 69, 80, 91] as const

function TrainJourneyScene({
  item,
  route,
  running,
  reduceMotion,
  compact = false,
}: {
  item: Carriage
  route: TrainRoute
  running: boolean
  reduceMotion: boolean
  compact?: boolean
}) {
  // Five full-width scenes form one long route. The first and last tiles are
  // the same station, so resetting to the start after arrival is invisible.
  // The train never flips; four screen widths of scenery move past it.
  const scrollAnimation = reduceMotion
    ? { x: ['0%', '-4%', '0%'] }
    : { x: ['0%', '-5%', '-75%', '-80%'] }
  // Resetting to rest uses duration 0: because the tiles are identical, the
  // jump from a tile boundary back to 0% is visually indistinguishable, so
  // there is no ugly rewind when the run ends.
  const scrollTransition = running
    ? reduceMotion
      ? { duration: 0.75, ease: 'easeInOut' as const }
      : {
          duration: JOURNEY_DURATION_SECONDS,
          times: [0, 0.08, 0.92, 1],
          ease: 'linear' as const,
        }
    : { duration: 0 }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Sky + ground stay fixed; only the scenery strip scrolls */}
      <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-b from-transparent via-emerald-50/60 to-green-200" />
      <div className="absolute right-6 top-8 h-9 w-9 rounded-full bg-amber-200/80 shadow-[0_0_22px_rgba(253,230,138,0.85)]" />
      <div className="absolute left-8 top-5 h-6 w-14 rounded-full bg-white/70 blur-[1px]" />
      <div className="absolute right-16 top-12 h-5 w-11 rounded-full bg-white/60 blur-[1px]" />

      {/* Continuous rails sit above the scrolling sleepers */}
      <div className="absolute inset-x-0 bottom-[30px] z-[6] h-[3px] bg-slate-500/70" />
      <div className="absolute inset-x-0 bottom-[24px] z-[6] h-[3px] bg-slate-400/60" />

      {/* Four screen widths of distinct scenery, ending at the origin station. */}
      <motion.div
        className="absolute inset-y-0 left-0 flex w-[500%]"
        initial={false}
        animate={scrollAnimation}
        transition={scrollTransition}
      >
        <SceneryTile scene="station" route={route} running={running} reduceMotion={reduceMotion} />
        <SceneryTile scene="pasture" route={route} running={running} reduceMotion={reduceMotion} />
        <SceneryTile scene="river" route={route} running={running} reduceMotion={reduceMotion} />
        <SceneryTile scene="town" route={route} running={running} reduceMotion={reduceMotion} />
        <SceneryTile scene="station" route={route} running={running} reduceMotion={reduceMotion} />
      </motion.div>

      {running && !reduceMotion && (
        <div className="absolute inset-0 z-[8] overflow-hidden">
          {[0, 1, 2].map((line) => (
            <motion.span
              key={line}
              className="absolute h-0.5 w-20 rounded-full bg-white/60"
              style={{ top: `${34 + line * 16}%` }}
              initial={{ x: 520, opacity: 0 }}
              animate={{ x: -120, opacity: [0, 0.85, 0] }}
              transition={{
                duration: 0.65,
                repeat: Infinity,
                delay: line * 0.18,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      )}

      {/* Station bell, parked beside the train — rings on departure / arrival */}
      <motion.span
        className="absolute bottom-[64px] left-[22%] z-20 flex h-7 w-7 items-center justify-center rounded-full bg-amber-300 text-amber-800 shadow-md"
        animate={running && !reduceMotion ? { rotate: [0, 16, -16, 12, -8, 0] } : { rotate: 0 }}
        transition={{ duration: 0.7, repeat: running ? Infinity : 0, repeatDelay: 0.6 }}
      >
        <BellRing size={16} />
      </motion.span>

      {/* The train holds its position; the bob + wheels sell the motion */}
      <motion.div
        data-testid={compact ? 'train-detail-runner' : 'train-stage-runner'}
        className="absolute bottom-[20px] left-[8%] z-20 h-[72px] w-[102px] origin-bottom"
        initial={false}
        animate={running && !reduceMotion ? { y: [0, -2, 0] } : { y: 0 }}
        transition={{ duration: 0.32, repeat: running && !reduceMotion ? Infinity : 0, ease: 'easeInOut' }}
      >
        <TrainEngineArt item={item} compact running={running && !reduceMotion} />
      </motion.div>

    </div>
  )
}

type JourneyScene = 'station' | 'pasture' | 'river' | 'town'

function SceneryTile({
  scene,
  route,
  running,
  reduceMotion,
}: {
  scene: JourneyScene
  route: TrainRoute
  running: boolean
  reduceMotion: boolean
}) {
  return (
    <div className="relative h-full w-1/5 shrink-0">
      {/* Railroad ties */}
      {SLEEPER_OFFSETS.map((offset) => (
        <span
          key={offset}
          className="absolute bottom-[20px] z-[4] h-[12px] w-[3px] rounded-sm bg-amber-800/55"
          style={{ left: `${offset}%` }}
        />
      ))}

      {scene === 'station' && (
        <>
          <div className="absolute bottom-[36px] left-[5%] z-[15] flex flex-col items-center">
            <span className="flex max-w-[110px] items-center gap-1 truncate rounded-lg bg-white px-2 py-1 text-[11px] font-extrabold text-sky-800 shadow-md ring-1 ring-sky-100">
              <MapPin size={10} className="shrink-0" /> {route.destination}
            </span>
            <span className="h-8 w-1.5 bg-slate-500" />
          </div>
          <span className="absolute bottom-[35px] left-[70%] z-10 text-3xl">🌳</span>
          <span className="absolute bottom-[32px] left-[88%] z-10 text-xl">🌼</span>
        </>
      )}

      {scene === 'pasture' && (
        <>
          <div className="absolute bottom-[36px] left-[28%] z-10 flex items-end gap-2 rounded-2xl bg-white/45 px-3 py-1 shadow-sm">
            <motion.span
              className="text-3xl"
              animate={running && !reduceMotion ? { y: [0, -2, 0] } : { y: 0 }}
              transition={{ duration: 0.55, repeat: running ? Infinity : 0 }}
            >
              🐄
            </motion.span>
            <motion.span
              className="text-2xl"
              animate={running && !reduceMotion ? { y: [0, -2, 0] } : { y: 0 }}
              transition={{ duration: 0.5, repeat: running ? Infinity : 0, delay: 0.12 }}
            >
              🐑
            </motion.span>
          </div>
          <span className="absolute bottom-[40px] left-[72%] z-10 text-3xl">🌳</span>
          <span className="absolute bottom-[34px] left-[88%] z-10 text-xl">🌻</span>
        </>
      )}

      {scene === 'river' && (
        <>
          <span className="absolute bottom-[8px] left-[8%] h-9 w-[84%] rounded-[50%] bg-sky-300/70" />
          <span className="absolute bottom-[38px] left-[30%] z-10 text-4xl drop-shadow-sm">🌉</span>
          <span className="absolute bottom-[40px] left-[72%] z-10 text-3xl">🌲</span>
          <motion.span
            className="absolute bottom-[10px] left-[68%] text-lg"
            animate={running && !reduceMotion ? { x: [0, 12, 0] } : { x: 0 }}
            transition={{ duration: 0.8, repeat: running ? Infinity : 0 }}
          >
            🦆
          </motion.span>
        </>
      )}

      {scene === 'town' && (
        <>
          <span className="absolute bottom-[36px] left-[18%] z-10 text-4xl">🏠</span>
          <span className="absolute bottom-[36px] left-[42%] z-10 text-4xl">🏡</span>
          <span className="absolute bottom-[38px] left-[70%] z-10 text-3xl">🌳</span>
          <span className="absolute bottom-[34px] left-[88%] z-10 text-2xl">🚦</span>
        </>
      )}
    </div>
  )
}
