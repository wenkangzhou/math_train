import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, CheckCircle2, Clock3, X } from 'lucide-react'
import type { Question } from '@/types/math'
import type { WrongQuestionRecord } from '@/types/storage'

interface WrongBookDrawerProps {
  open: boolean
  records: WrongQuestionRecord[]
  onClose: () => void
  onPracticePending: () => void
}

function equationText(question: Question): string {
  const sign = question.operation === 'addition' ? '+' : '−'
  return `${question.fullLeft} ${sign} ${question.fullRight} = ${question.fullResult}`
}

export function WrongBookDrawer({
  open,
  records,
  onClose,
  onPracticePending,
}: WrongBookDrawerProps) {
  const [tab, setTab] = useState<'pending' | 'mastered'>('pending')
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const pending = useMemo(() => records.filter((item) => !item.mastered), [records])
  const mastered = useMemo(() => records.filter((item) => item.mastered), [records])
  const visible = tab === 'pending' ? pending : mastered

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="关闭错题本"
            className="fixed inset-0 z-40 cursor-default bg-slate-900/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="wrongbook-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[88dvh] flex-col rounded-t-[32px] bg-[#f5fbff] shadow-2xl ipad-land:bottom-0 ipad-land:left-auto ipad-land:right-0 ipad-land:top-0 ipad-land:h-full ipad-land:w-[500px] ipad-land:rounded-l-[32px] ipad-land:rounded-tr-none"
          >
            <header className="flex items-center justify-between border-b border-sky-100 px-5 py-4 sm:px-6">
              <div>
                <h2 id="wrongbook-title" className="text-2xl font-extrabold text-slate-700">
                  长期错题本
                </h2>
                <p className="mt-0.5 text-sm font-medium text-slate-400">
                  独立答对两次后自动移入“已掌握”
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200"
              >
                <X size={22} />
              </button>
            </header>

            <div className="px-5 pt-4 sm:px-6">
              <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1.5">
                <TabButton
                  active={tab === 'pending'}
                  label={`待巩固 ${pending.length}`}
                  onClick={() => setTab('pending')}
                />
                <TabButton
                  active={tab === 'mastered'}
                  label={`已掌握 ${mastered.length}`}
                  onClick={() => setTab('mastered')}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              {visible.length > 0 ? (
                <div className="space-y-3">
                  {visible.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-[24px] bg-white p-4 shadow-soft ring-1 ring-sky-100"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-digit text-2xl text-slate-700">
                            {equationText(item.question)}
                          </p>
                          <p className="mt-1 text-xs font-medium text-slate-400">
                            {item.question.range} 以内{item.question.operation === 'addition' ? '加法' : '减法'}
                          </p>
                        </div>
                        <span className={[
                          'shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold',
                          item.mastered
                            ? 'bg-green-100 text-green-600'
                            : 'bg-orange-100 text-coral',
                        ].join(' ')}>
                          {item.mastered
                            ? '已掌握'
                            : `再答对 ${2 - item.correctCountAfterWrong} 次`}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-400">
                        {item.wrongAnswers.length > 0 && (
                          <span>曾答：{item.wrongAnswers.join('、')}</span>
                        )}
                        <span>累计尝试 {item.attempts} 次</span>
                        <span className="flex items-center gap-1">
                          <Clock3 size={13} />
                          {new Date(item.lastPracticedAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                  {tab === 'pending' ? (
                    <CheckCircle2 size={54} className="text-grass" />
                  ) : (
                    <BookOpen size={54} className="text-sky" />
                  )}
                  <p className="mt-4 text-xl font-extrabold text-slate-600">
                    {tab === 'pending' ? '暂时没有待巩固错题' : '掌握的题目会出现在这里'}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-400">
                    {tab === 'pending' ? '继续保持，认真完成每一道题！' : '同一道错题连续答对两次即可掌握'}
                  </p>
                </div>
              )}
            </div>

            {tab === 'pending' && pending.length > 0 && (
              <footer className="border-t border-sky-100 bg-white/80 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:px-6">
                <button
                  type="button"
                  onClick={onPracticePending}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-coral to-amber-400 py-4 text-lg font-extrabold text-white shadow-soft"
                >
                  <BookOpen size={21} /> 巩固错题 · {Math.min(pending.length, 10)} 题
                </button>
              </footer>
            )}
          </motion.section>
        </>
      )}
    </AnimatePresence>
  )
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full py-2.5 text-sm font-extrabold transition',
        active ? 'bg-white text-sky-deep shadow-sm' : 'text-slate-400',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
