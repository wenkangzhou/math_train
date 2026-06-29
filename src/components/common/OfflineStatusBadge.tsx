import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export function OfflineStatusBadge() {
  const [online, setOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          role="status"
          className="bottom-safe fixed left-3 z-[70] flex items-center gap-2 rounded-full bg-slate-700 px-4 py-2 text-sm font-bold text-white shadow-xl ring-1 ring-white/20"
        >
          <WifiOff size={17} /> 已离线，仍可继续练习
        </motion.div>
      )}
    </AnimatePresence>
  )
}
