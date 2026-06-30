import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, Clock3, ListChecks, X } from 'lucide-react'
import type { PracticeHistoryItem } from '@/types/storage'
import { toDateStr } from '@/lib/date'
import {
  groupPracticeHistory,
  practiceSessionDurationMs,
  summarizePracticeHistory,
} from '@/lib/practiceHistory'

interface PracticeHistoryDrawerProps {
  open: boolean
  records: PracticeHistoryItem[]
  onClose: () => void
}

const TIME_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const DAY_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
})

export function PracticeHistoryDrawer({
  open,
  records,
  onClose,
}: PracticeHistoryDrawerProps) {
  const summary = useMemo(() => summarizePracticeHistory(records), [records])
  const days = useMemo(() => groupPracticeHistory(records), [records])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose, open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="关闭答题记录"
            className="fixed inset-0 z-40 cursor-default bg-slate-900/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="practice-history-title"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[88dvh] flex-col rounded-t-[32px] bg-[#f5fbff] shadow-2xl ipad-land:bottom-0 ipad-land:left-auto ipad-land:right-0 ipad-land:top-0 ipad-land:h-full ipad-land:w-[520px] ipad-land:rounded-l-[32px] ipad-land:rounded-tr-none"
          >
            <header className="flex items-center justify-between border-b border-sky-100 px-5 py-4 sm:px-6">
              <div>
                <h2 id="practice-history-title" className="text-2xl font-extrabold text-slate-700">
                  答题记录
                </h2>
                <p className="mt-0.5 text-sm font-medium text-slate-400">
                  每轮练习、每日累计与本周累计
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

            <div className="grid grid-cols-2 gap-3 px-5 pt-4 sm:px-6">
              <SummaryCard
                icon={<Clock3 size={20} />}
                label="今天累计"
                durationMs={summary.today.durationMs}
                questions={summary.today.questionCount}
              />
              <SummaryCard
                icon={<CalendarDays size={20} />}
                label="本周累计"
                durationMs={summary.week.durationMs}
                questions={summary.week.questionCount}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:px-6">
              {days.length > 0 ? (
                <div className="space-y-4">
                  {days.map((day) => (
                    <section key={day.dateKey} aria-label={`${day.dateKey}答题记录`}>
                      <div className="mb-2 flex items-end justify-between gap-3 px-1">
                        <div>
                          <h3 className="text-base font-extrabold text-slate-700">
                            {formatDayLabel(day.dateKey)}
                          </h3>
                          <p className="mt-0.5 text-xs font-bold text-slate-400">
                            当天累计 {formatDuration(day.durationMs)} · {day.questionCount} 题
                          </p>
                        </div>
                        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-extrabold text-sky-700">
                          {day.sessionCount} 次
                        </span>
                      </div>

                      <div className="overflow-hidden rounded-[22px] bg-white shadow-soft ring-1 ring-sky-100">
                        {day.sessions.map((record, index) => {
                          const durationMs = practiceSessionDurationMs(record)
                          return (
                            <article
                              key={record.id}
                              className={[
                                'flex items-center justify-between gap-4 px-4 py-3.5',
                                index > 0 ? 'border-t border-slate-100' : '',
                              ].join(' ')}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-deep">
                                  <ListChecks size={19} />
                                </span>
                                <div className="min-w-0">
                                  <p className="font-extrabold text-slate-700">
                                    {record.totalQuestions} 题 · 答对 {record.correctQuestions} 题
                                  </p>
                                  <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                    {formatTimeRange(record.startedAt, record.completedAt)}
                                    {' · '}{Math.round(record.accuracy * 100)}% 正确率
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-sm font-extrabold text-coral">
                                  {durationMs > 0 ? formatDuration(durationMs, true) : '未记录'}
                                </p>
                                <p className="mt-0.5 text-[11px] font-bold text-slate-400">连续答题</p>
                              </div>
                            </article>
                          )
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-72 flex-col items-center justify-center text-center">
                  <ListChecks size={56} className="text-sky" />
                  <p className="mt-4 text-xl font-extrabold text-slate-600">还没有答题记录</p>
                  <p className="mt-1 text-sm font-medium text-slate-400">
                    完成一轮练习后，时间和题数会保存在这里
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  )
}

function SummaryCard({
  icon,
  label,
  durationMs,
  questions,
}: {
  icon: React.ReactNode
  label: string
  durationMs: number
  questions: number
}) {
  return (
    <div className="rounded-[22px] bg-white p-4 shadow-soft ring-1 ring-sky-100">
      <span className="flex items-center gap-2 text-sm font-extrabold text-sky-deep">
        {icon} {label}
      </span>
      <p className="mt-2 text-xl font-extrabold text-slate-700">
        {formatDuration(durationMs)}
      </p>
      <p className="mt-0.5 text-xs font-bold text-slate-400">共完成 {questions} 题</p>
    </div>
  )
}

function formatDuration(durationMs: number, precise = false): string {
  const seconds = Math.max(0, Math.round(durationMs / 1000))
  if (seconds === 0) return '0分钟'
  if (seconds < 60) return `${seconds}秒`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  if (hours > 0) return `${hours}小时${minutes > 0 ? `${minutes}分钟` : ''}`
  if (precise && remainingSeconds > 0) return `${minutes}分${remainingSeconds}秒`
  return `${minutes}分钟`
}

function formatDayLabel(dateKey: string): string {
  const now = new Date()
  if (dateKey === toDateStr(now)) return `今天 · ${DAY_FORMATTER.format(now)}`
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (dateKey === toDateStr(yesterday)) {
    return `昨天 · ${DAY_FORMATTER.format(yesterday)}`
  }
  return DAY_FORMATTER.format(new Date(`${dateKey}T00:00:00`))
}

function formatTimeRange(startedAt: string, completedAt: string): string {
  const start = new Date(startedAt)
  const end = new Date(completedAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '时间未知'
  return `${TIME_FORMATTER.format(start)}–${TIME_FORMATTER.format(end)}`
}
