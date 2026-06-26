import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

interface MascotHeaderProps {
  totalStars: number
}

export function MascotHeader({ totalStars }: MascotHeaderProps) {
  return (
    <header className="relative flex flex-col items-center pb-2 pt-6 text-center">
      {totalStars > 0 && (
        <div className="absolute right-0 top-4 flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-amber-500 shadow-soft">
          <Star size={20} fill="currentColor" />
          <span className="font-extrabold">{totalStars}</span>
        </div>
      )}

      {/* 品牌 LOGO（已含小火车与「数数小火车」字样），轻微漂浮动画 */}
      <h1 className="sr-only">数数小火车 · Math Train</h1>
      <motion.img
        src="/logo.png"
        alt="数数小火车"
        width={1254}
        height={1254}
        className="h-auto w-60 max-w-[78%] drop-shadow-sm sm:w-72"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      />

      <p className="-mt-1 text-lg font-medium text-slate-500">
        和小火车一起学加减法
      </p>
    </header>
  )
}
