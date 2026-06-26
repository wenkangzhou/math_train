import { AnimatePresence, motion } from 'framer-motion'
import { Star } from 'lucide-react'

interface FeedbackOverlayProps {
  state: 'idle' | 'correct' | 'wrong'
  message: string
}

// 答对/答错的温和反馈浮层 + 飞星动画
export function FeedbackOverlay({ state, message }: FeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {state !== 'idle' && (
        <motion.div
          key={state + message}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 320, damping: 20 }}
          className="pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2"
        >
          <div
            className={[
              'flex items-center gap-2 rounded-full px-6 py-3 text-xl font-extrabold text-white shadow-soft sm:text-2xl',
              state === 'correct' ? 'bg-grass' : 'bg-coral',
            ].join(' ')}
          >
            {state === 'correct' && <Star size={24} fill="currentColor" />}
            {message}
          </div>
        </motion.div>
      )}

      {/* 答对时一颗星飞向顶部计数器 */}
      {state === 'correct' && (
        <motion.div
          key="flying-star"
          initial={{ opacity: 1, scale: 1, top: '40%', left: '50%' }}
          animate={{ opacity: 0, scale: 0.4, top: '-12%', left: '88%' }}
          transition={{ duration: 1, ease: 'easeIn' }}
          className="pointer-events-none absolute z-30 -translate-x-1/2 text-amber-400"
        >
          <Star size={44} fill="currentColor" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
