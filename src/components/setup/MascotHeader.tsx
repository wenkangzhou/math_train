import { motion } from 'framer-motion'

export function MascotHeader() {
  return (
    <header className="relative flex flex-col items-center pb-2 pt-6 text-center">
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
