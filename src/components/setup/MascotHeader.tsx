import { motion } from 'framer-motion'
import { TrainMascot } from '@/components/common/TrainMascot'

export function MascotHeader() {
  return (
    <header className="relative flex items-center justify-center gap-3 pb-1 pt-1 text-center ipad-land:gap-3 ipad-land:pb-1 ipad-land:pt-1">
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <TrainMascot mood="happy" size={52} />
      </motion.div>

      <div className="text-left">
        <h1 className="text-xl font-extrabold text-slate-700 ipad-land:text-2xl">
          数数小火车
        </h1>
        <p className="text-xs font-medium text-slate-500 ipad-land:text-sm">
          和小火车一起学加减法
        </p>
      </div>
    </header>
  )
}
