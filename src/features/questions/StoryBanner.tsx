// 数数小火车 / Math Train — 故事题横幅（PRD 功能十四）
// 在算式上方显示 1~2 句故事，并提供朗读按钮。

import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import type { Question } from '@/types/math'

interface StoryBannerProps {
  question: Question
  onSpeak: () => void
}

export function StoryBanner({ question, onSpeak }: StoryBannerProps) {
  if (!question.story) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full items-center gap-3 rounded-card bg-grass/10 px-4 py-3 shadow-soft ring-1 ring-grass/30 sm:px-5"
    >
      <span className="text-2xl" aria-hidden="true">
        📖
      </span>
      <p className="flex-1 text-base font-medium leading-relaxed text-slate-700 sm:text-lg">
        {question.story}
      </p>
      <button
        type="button"
        onClick={onSpeak}
        className="shrink-0 rounded-full bg-white/80 p-2 text-grass shadow-soft transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-grass/40"
        aria-label="朗读故事"
      >
        <Volume2 size={20} />
      </button>
    </motion.div>
  )
}
