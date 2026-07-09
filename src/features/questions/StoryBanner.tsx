// 数数小火车 / Math Train — 故事题横幅（PRD 功能十四）
// 在算式上方显示 1~2 句故事，并提供朗读按钮。

import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import type { Question } from '@/types/math'
import { getPictureBookScene } from '@/lib/pictureBook'

interface StoryBannerProps {
  question: Question
  onSpeak: () => void
}

export function StoryBanner({ question, onSpeak }: StoryBannerProps) {
  if (!question.story) return null
  const scene = getPictureBookScene(question)
  return (
    <motion.div
      data-testid="story-banner"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex w-full items-center gap-3 overflow-hidden rounded-card bg-gradient-to-br ${scene.cardClass} px-4 py-3 shadow-soft ring-1 sm:px-5 ipad-land:py-2.5`}
    >
      <div className="absolute right-0 top-[-2.5rem] h-24 w-24 rounded-full bg-white/45 sm:-right-8" />
      <div className="absolute bottom-2 right-16 h-4 w-12 rounded-full bg-white/50" />
      <span
        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/75 text-3xl shadow-sm ring-1 ring-white/80 ipad-land:h-10 ipad-land:w-10 ipad-land:text-2xl"
        aria-hidden="true"
      >
        {scene.sceneEmoji}
      </span>
      <div className="relative min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${scene.accentClass}`}>
            📖 绘本任务
          </span>
          <span className="text-xs font-bold text-slate-400">
            {scene.actorEmoji} {question.storyActor ?? scene.actor} · {question.storyScene ?? scene.sceneName}
          </span>
        </div>
        <h2 className="truncate text-base font-extrabold text-slate-700 sm:text-lg ipad-land:text-base">
          {question.storyTitle ?? scene.title}
        </h2>
        <p className="mt-0.5 text-sm font-semibold leading-relaxed text-slate-600 sm:text-base ipad-land:text-sm">
          {question.story}
        </p>
      </div>
      <button
        type="button"
        onClick={onSpeak}
        className="relative shrink-0 rounded-full bg-white/85 p-2 text-grass shadow-soft transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-grass/40"
        aria-label="朗读故事"
      >
        <Volume2 size={20} />
      </button>
    </motion.div>
  )
}
