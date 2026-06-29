import { motion } from 'framer-motion'
import { RotateCcw, BookOpen, Settings } from 'lucide-react'

interface ResultActionsProps {
  hasWrong: boolean
  onReplay: () => void
  onPracticeWrong: () => void
  onReconfigure: () => void
}

function ActionButton({
  label,
  icon,
  onClick,
  primary,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  primary?: boolean
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={[
        'flex items-center justify-center gap-2 rounded-full py-4 text-lg font-extrabold shadow-soft transition focus:outline-none focus-visible:ring-4',
        primary
          ? 'bg-gradient-to-r from-coral to-amber-400 text-white focus-visible:ring-coral/50 hover:brightness-105'
          : 'bg-white/85 text-slate-600 ring-2 ring-slate-200 focus-visible:ring-sky/50 hover:bg-white',
      ].join(' ')}
    >
      {icon}
      {label}
    </motion.button>
  )
}

export function ResultActions({
  hasWrong,
  onReplay,
  onPracticeWrong,
  onReconfigure,
}: ResultActionsProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
      <ActionButton
        label="再练一次"
        icon={<RotateCcw size={22} />}
        onClick={onReplay}
        primary
      />
      {hasWrong && (
        <ActionButton
          label="练习错题"
          icon={<BookOpen size={22} />}
          onClick={onPracticeWrong}
        />
      )}
      <ActionButton
        label="重新选择"
        icon={<Settings size={22} />}
        onClick={onReconfigure}
      />
    </div>
  )
}
