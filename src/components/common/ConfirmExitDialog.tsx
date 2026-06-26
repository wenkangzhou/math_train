import { AnimatePresence, motion } from 'framer-motion'

interface ConfirmExitDialogProps {
  open: boolean
  onContinue: () => void
  onExit: () => void
}

export function ConfirmExitDialog({
  open,
  onContinue,
  onExit,
}: ConfirmExitDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onContinue}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="w-full max-w-sm rounded-card bg-white p-6 text-center shadow-soft"
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 text-5xl">🚂</div>
            <p className="mb-6 text-xl font-bold text-slate-700">
              练习还没有完成，
              <br />
              要回到设置页吗？
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={onContinue}
                className="rounded-full bg-grass py-4 text-lg font-extrabold text-white shadow-soft transition hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-grass/60"
              >
                继续练习
              </button>
              <button
                type="button"
                onClick={onExit}
                className="rounded-full bg-slate-100 py-4 text-lg font-bold text-slate-500 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
              >
                回到设置页
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
