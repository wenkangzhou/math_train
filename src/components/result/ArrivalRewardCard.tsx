import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { MapPin, Stamp } from 'lucide-react'
import type { RouteReward } from '@/types/rewards'
import { CARRIAGE_CATALOG, getCarriage } from '@/lib/carriages'
import { TrainEngineArt } from '@/components/rewards/TrainEngineArt'

interface ArrivalRewardCardProps {
  reward: RouteReward
  earnedStars: number
}

function TripRewardPill({
  emoji,
  label,
  value,
}: {
  emoji: string
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-white/85 px-2.5 py-2 text-center shadow-sm ring-1 ring-sky-100">
      <span className="block text-2xl" aria-hidden="true">{emoji}</span>
      <span className="mt-0.5 block text-[11px] font-bold text-slate-400">
        {label}
      </span>
      <span className="block text-sm font-extrabold text-slate-700">
        {value}
      </span>
    </div>
  )
}

export function ArrivalRewardCard({ reward, earnedStars }: ArrivalRewardCardProps) {
  const reduceMotion = useReducedMotion()
  const [arriving, setArriving] = useState(true)
  const train = getCarriage(reward.trainId) ?? CARRIAGE_CATALOG[0]

  useEffect(() => {
    if (reduceMotion) {
      setArriving(false)
      return
    }
    const timer = window.setTimeout(() => setArriving(false), 1400)
    return () => window.clearTimeout(timer)
  }, [reduceMotion])

  return (
    <motion.section
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.22, type: 'spring', stiffness: 220, damping: 20 }}
      className="overflow-hidden rounded-[26px] bg-gradient-to-br from-sky-100 via-white to-amber-50 ring-2 ring-sky-200"
      aria-label={`到达${reward.destination}，第${reward.tripCount}次完成路线`}
    >
      <div className="relative h-28 overflow-hidden">
        <div className="absolute left-5 top-4 h-5 w-14 rounded-full bg-white/80" />
        <div className="absolute right-5 top-8 h-4 w-10 rounded-full bg-white/70" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-emerald-100" />
        <div className="absolute inset-x-0 bottom-4 h-1.5 bg-slate-400/60" />
        <div className="absolute inset-x-0 bottom-1 h-1.5 bg-slate-400/60" />

        <div className="absolute bottom-5 right-4 z-10 flex flex-col items-center">
          <span className="flex min-h-9 items-center gap-1 rounded-xl bg-white px-3 py-1 text-xs font-extrabold text-sky-800 shadow-md ring-1 ring-sky-100">
            <MapPin size={14} /> {reward.destination}
          </span>
          <span className="h-6 w-1.5 bg-slate-500" />
        </div>

        <motion.div
          className="absolute bottom-4 left-5 z-20 origin-bottom-left scale-[0.72]"
          initial={reduceMotion ? false : { x: -150 }}
          animate={{ x: 0, y: arriving && !reduceMotion ? [0, -1.5, 0] : 0 }}
          transition={{
            x: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 0.35, repeat: arriving ? Infinity : 0 },
          }}
          aria-hidden="true"
        >
          <TrainEngineArt item={train} compact running={arriving && !reduceMotion} />
        </motion.div>
      </div>

      <div className="flex items-center gap-3 border-t border-sky-100 bg-white/75 p-4 pb-3">
        <motion.span
          initial={reduceMotion ? false : { rotate: -18, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.75, type: 'spring', stiffness: 280 }}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-3xl shadow-sm ring-2 ring-dashed ring-amber-300"
          aria-hidden="true"
        >
          {reward.stampEmoji}
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-xs font-extrabold text-coral">
            <Stamp size={14} /> {reward.isNewStamp ? '获得新路线邮票' : `第 ${reward.tripCount} 次到站`}
          </p>
          <h2 className="mt-0.5 truncate text-xl font-extrabold text-slate-700">
            抵达{reward.destination}！
          </h2>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            {reward.cargoEmoji} {reward.missionTitle}
          </p>
        </div>
      </div>

      <div className="border-t border-sky-100 bg-white/60 px-4 pb-4 pt-3">
        <p className="mb-2 text-center text-xs font-extrabold text-sky-deep">
          🎁 本趟小收获 · 每跑完一趟都会多一枚到站章
        </p>
        <div className="grid grid-cols-3 gap-2">
          <TripRewardPill
            emoji={reward.stampEmoji}
            label={reward.isNewStamp ? '新邮票' : '到站章'}
            value="+1"
          />
          <TripRewardPill
            emoji="🚉"
            label="这条路线"
            value={`第 ${reward.tripCount} 次`}
          />
          <TripRewardPill
            emoji="⭐"
            label="星星"
            value={`+${earnedStars}`}
          />
        </div>
      </div>
    </motion.section>
  )
}
