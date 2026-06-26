import { motion } from 'framer-motion'

// 完成时的庆祝彩纸/星星爆发（一次性，不持续）
const PIECES = Array.from({ length: 14 }, (_, i) => i)
const EMOJIS = ['⭐', '🎉', '🌟', '🎈', '✨']
const COLORS = ['#4fb0f0', '#ff8a65', '#8ed081', '#ffb300', '#ffb3d9']

export function Celebration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PIECES.map((i) => {
        const left = (i * 37) % 100
        const delay = (i % 5) * 0.08
        const emoji = EMOJIS[i % EMOJIS.length]
        const color = COLORS[i % COLORS.length]
        return (
          <motion.div
            key={i}
            className="absolute text-2xl"
            style={{ left: `${left}%`, top: '-8%', color }}
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{
              y: ['-8%', '110vh'],
              opacity: [0, 1, 1, 0],
              rotate: [0, i % 2 ? 360 : -360],
            }}
            transition={{
              duration: 2.4 + (i % 4) * 0.3,
              delay,
              ease: 'easeIn',
            }}
          >
            {emoji}
          </motion.div>
        )
      })}
    </div>
  )
}
