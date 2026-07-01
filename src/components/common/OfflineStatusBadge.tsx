import { AlertTriangle, WifiOff } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOfflineStatus } from '@/lib/useOfflineStatus'

export function OfflineStatusBadge() {
  const { online, cacheStatus } = useOfflineStatus()
  const showProblem = !online || cacheStatus === 'error' || cacheStatus === 'unsupported'
  const message = !online
    ? cacheStatus === 'ready'
      ? '已离线，仍可继续练习'
      : '网络已断开，请先保持本页打开'
    : '离线准备失败，联网时仍可正常练习'

  return (
    <AnimatePresence>
      {showProblem && (
        <motion.div
          key={!online ? 'offline' : 'cache-error'}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          role="status"
          className="bottom-safe fixed left-3 z-[70] flex items-center gap-2 rounded-full bg-slate-700 px-4 py-2 text-sm font-bold text-white shadow-xl ring-1 ring-white/20"
        >
          {!online ? <WifiOff size={17} /> : <AlertTriangle size={17} />}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
