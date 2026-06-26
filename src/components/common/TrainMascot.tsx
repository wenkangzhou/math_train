import { motion } from 'framer-motion'

export type MascotMood = 'happy' | 'thinking' | 'cheer' | 'idle'

interface TrainMascotProps {
  mood?: MascotMood
  size?: number
}

// 数数小火车吉祥物：一辆友好的小火车 🚂
// 使用 emoji + 轻量动画，结构方便未来替换为正式插画。
export function TrainMascot({ mood = 'idle', size = 88 }: TrainMascotProps) {
  const face = {
    idle: '🚂',
    happy: '🚂',
    thinking: '🚂',
    cheer: '🚂',
  }[mood]

  const animate =
    mood === 'cheer'
      ? { y: [0, -14, 0], rotate: [0, -4, 4, 0] }
      : mood === 'happy'
        ? { y: [0, -8, 0] }
        : mood === 'thinking'
          ? { rotate: [0, -3, 3, 0] }
          : { y: [0, -5, 0] } // idle 呼吸/摆动

  const duration =
    mood === 'cheer' ? 0.6 : mood === 'thinking' ? 1.2 : mood === 'idle' ? 2.4 : 0.5

  const emoji = {
    idle: '',
    happy: '😄',
    thinking: '🤔',
    cheer: '🎉',
  }[mood]

  return (
    <div className="relative inline-flex flex-col items-center" aria-hidden="true">
      <motion.div
        style={{ fontSize: size }}
        className="leading-none drop-shadow"
        animate={animate}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'easeInOut',
        }}
      >
        {face}
      </motion.div>
      {emoji && (
        <motion.span
          className="absolute -right-2 -top-1 text-3xl"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.4 }}
        >
          {emoji}
        </motion.span>
      )}
    </div>
  )
}
