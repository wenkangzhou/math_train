import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, CalendarClock, CheckCircle2, ChevronDown, Clock3, Wrench, X } from 'lucide-react'
import type { Question } from '@/types/math'
import type { WrongQuestionRecord } from '@/types/storage'
import { REVIEW_INTERVAL_DAYS, daysUntilReview, isReviewDue } from '@/lib/spacedReview'

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
  const [showRecords, setShowRecords] = useState(false)
  useEffect(() => {
    if (!open) return
    setTab('pending')
    setShowRecords(false)
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

  const pending = useMemo(
    () => records
      .filter((item) => !item.mastered)
      .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt)),
    [records],
  )
  const mastered = useMemo(() => records.filter((item) => item.mastered), [records])
  const due = useMemo(() => pending.filter((item) => isReviewDue(item)), [pending])
  const visible = tab === 'pending' ? pending : mastered
  const waitingDays = pending.map((item) => daysUntilReview(item)).filter((days) => days > 0)
  const nextWaitingDays = waitingDays.length > 0 ? Math.min(...waitingDays) : 1

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
                  旧题修理站
                </h2>
                <p className="mt-0.5 text-sm font-medium text-slate-400">
                  长期错题本 · 隔几天再答一次，记得更牢
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

            <div className="flex-1 overflow-y-auto px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-5 sm:px-6">
              <section className={[
                'rounded-[28px] p-5 text-center ring-1',
                due.length > 0
                  ? 'bg-gradient-to-br from-orange-50 to-amber-100 ring-amber-200'
                  : 'bg-gradient-to-br from-emerald-50 to-sky-50 ring-emerald-100',
              ].join(' ')}>
                <span className={[
                  'mx-auto flex h-16 w-16 items-center justify-center rounded-3xl text-white shadow-soft',
                  due.length > 0 ? 'bg-coral' : 'bg-grass',
                ].join(' ')}>
                  {due.length > 0 ? <Wrench size={32} /> : <CheckCircle2 size={34} />}
                </span>
                <h3 className="mt-4 text-2xl font-extrabold text-slate-700">
                  {due.length > 0
                    ? `今天有 ${due.length} 道旧题等你修好`
                    : pending.length > 0
                      ? '今天的旧题已经修好啦'
                      : records.length > 0
                        ? '旧题全部修好啦'
                        : '还没有需要修的旧题'}
                </h3>
                <p className="mt-2 text-sm font-bold text-slate-500">
                  {due.length > 0
                    ? '重新想一想、再答对一次，就能向前走一关。'
                    : pending.length > 0
                      ? `${nextWaitingDays === 1 ? '明天' : `${nextWaitingDays} 天后`}再回来看看，记忆会越来越牢。`
                      : '继续认真做题，有需要时这里会帮你记住。'}
                </p>
                {due.length > 0 && (
                  <button
                    type="button"
                    onClick={onPracticePending}
                    className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-coral to-amber-400 px-5 text-lg font-extrabold text-white shadow-soft focus:outline-none focus-visible:ring-4 focus-visible:ring-coral/40"
                  >
                    <Wrench size={22} /> 开始修题 · {Math.min(due.length, 10)} 道
                  </button>
                )}
              </section>

              <section className="mt-4 rounded-[26px] bg-white p-4 shadow-soft ring-1 ring-sky-100">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-700">修题小路线</h3>
                    <p className="mt-0.5 text-xs font-bold text-slate-400">每次按时答对，就前进一关</p>
                  </div>
                  <CalendarClock size={22} className="text-sky" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <JourneyStage emoji="🌅" label="第 1 关" timing="隔天" />
                  <JourneyStage emoji="🌳" label="第 2 关" timing="3 天后" />
                  <JourneyStage emoji="🏆" label="第 3 关" timing="7 天后" />
                </div>
              </section>

              <button
                type="button"
                aria-expanded={showRecords}
                aria-controls="wrongbook-records"
                onClick={() => setShowRecords((show) => !show)}
                className="mt-4 flex min-h-12 w-full items-center justify-between rounded-2xl bg-white px-4 text-sm font-extrabold text-slate-600 shadow-sm ring-1 ring-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/40"
              >
                <span>给大人看全部记录 · {records.length} 道</span>
                <ChevronDown
                  size={20}
                  className={showRecords ? 'rotate-180 transition-transform' : 'transition-transform'}
                />
              </button>

              <AnimatePresence initial={false}>
                {showRecords && (
                  <motion.div
                    id="wrongbook-records"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4">
                      <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1.5">
                        <TabButton
                          active={tab === 'pending'}
                          label={`复习计划 ${pending.length}`}
                          onClick={() => setTab('pending')}
                        />
                        <TabButton
                          active={tab === 'mastered'}
                          label={`已掌握 ${mastered.length}`}
                          onClick={() => setTab('mastered')}
                        />
                      </div>

                      <div className="mt-3">
                        {visible.length > 0 ? (
                          <div className="space-y-3">
                            {visible.map((item) => <WrongRecordCard key={item.id} item={item} />)}
                          </div>
                        ) : (
                          <div className="flex min-h-48 flex-col items-center justify-center rounded-[24px] bg-white text-center ring-1 ring-sky-100">
                            {tab === 'pending' ? (
                              <CheckCircle2 size={46} className="text-grass" />
                            ) : (
                              <BookOpen size={46} className="text-sky" />
                            )}
                            <p className="mt-3 text-lg font-extrabold text-slate-600">
                              {tab === 'pending' ? '暂时没有待复习题目' : '掌握的题目会出现在这里'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  )
}

function JourneyStage({
  emoji,
  label,
  timing,
}: {
  emoji: string
  label: string
  timing: string
}) {
  return (
    <div className="rounded-2xl bg-sky-50 px-2 py-3 text-center ring-1 ring-sky-100">
      <span className="text-2xl" aria-hidden="true">{emoji}</span>
      <span className="mt-1 block text-xs font-extrabold text-slate-600">{label}</span>
      <span className="block text-[11px] font-bold text-sky-700">{timing}</span>
    </div>
  )
}

function WrongRecordCard({ item }: { item: WrongQuestionRecord }) {
  return (
    <article className="rounded-[24px] bg-white p-4 shadow-soft ring-1 ring-sky-100">
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
          'shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-extrabold',
          item.mastered
            ? 'bg-green-100 text-green-600'
            : isReviewDue(item)
              ? 'bg-orange-100 text-coral'
              : 'bg-sky-100 text-sky-700',
        ].join(' ')}>
          {reviewStatus(item)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2" aria-label="间隔复习进度">
        {REVIEW_INTERVAL_DAYS.map((days, index) => {
          const completed = item.reviewStage > index
          const current = !item.mastered && item.reviewStage === index
          return (
            <div
              key={days}
              className={[
                'rounded-xl px-2 py-2 text-center text-xs font-extrabold ring-1',
                completed
                  ? 'bg-green-50 text-green-600 ring-green-200'
                  : current
                    ? 'bg-amber-50 text-amber-700 ring-amber-300'
                    : 'bg-slate-50 text-slate-400 ring-slate-100',
              ].join(' ')}
            >
              <span className="block text-base" aria-hidden="true">
                {completed ? '✓' : current ? '●' : '○'}
              </span>
              {days === 1 ? '隔天' : `${days} 天后`}
            </div>
          )
        })}
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
  )
}

function reviewStatus(item: WrongQuestionRecord): string {
  if (item.mastered) return '已掌握'
  if (isReviewDue(item)) return `今天复习 · 第 ${item.reviewStage + 1}/3 关`
  const days = daysUntilReview(item)
  return days === 1 ? '明天复习' : `${days} 天后复习`
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
