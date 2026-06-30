import type { PracticeHistoryItem } from '@/types/storage'
import { startOfWeekStr, toDateStr } from './date'

export interface PracticeTotals {
  durationMs: number
  questionCount: number
  sessionCount: number
}

export interface PracticeDaySummary extends PracticeTotals {
  dateKey: string
  sessions: PracticeHistoryItem[]
}

const EMPTY_TOTALS: PracticeTotals = {
  durationMs: 0,
  questionCount: 0,
  sessionCount: 0,
}

function completedDate(item: PracticeHistoryItem): Date | null {
  const date = new Date(item.completedAt)
  return Number.isNaN(date.getTime()) ? null : date
}

export function practiceSessionDurationMs(item: PracticeHistoryItem): number {
  const startedAt = new Date(item.startedAt).getTime()
  const completedAt = new Date(item.completedAt).getTime()
  const elapsed = completedAt - startedAt
  if (Number.isFinite(elapsed) && elapsed > 0) return elapsed

  const estimated = item.averageDurationMs * item.totalQuestions
  return Number.isFinite(estimated) && estimated > 0 ? estimated : 0
}

export function groupPracticeHistory(
  records: PracticeHistoryItem[],
): PracticeDaySummary[] {
  const byDay = new Map<string, PracticeDaySummary>()
  const sorted = [...records].sort(
    (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt),
  )

  for (const record of sorted) {
    const completed = completedDate(record)
    if (!completed) continue
    const dateKey = toDateStr(completed)
    const day = byDay.get(dateKey) ?? {
      dateKey,
      ...EMPTY_TOTALS,
      sessions: [],
    }
    day.durationMs += practiceSessionDurationMs(record)
    day.questionCount += Math.max(0, record.totalQuestions)
    day.sessionCount += 1
    day.sessions.push(record)
    byDay.set(dateKey, day)
  }

  return [...byDay.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey))
}

export function summarizePracticeHistory(
  records: PracticeHistoryItem[],
  now = new Date(),
): { today: PracticeTotals; week: PracticeTotals } {
  const todayKey = toDateStr(now)
  const weekStartKey = startOfWeekStr(now)
  const days = groupPracticeHistory(records)
  const today = { ...EMPTY_TOTALS }
  const week = { ...EMPTY_TOTALS }

  for (const day of days) {
    if (day.dateKey === todayKey) {
      today.durationMs += day.durationMs
      today.questionCount += day.questionCount
      today.sessionCount += day.sessionCount
    }
    if (day.dateKey >= weekStartKey && day.dateKey <= todayKey) {
      week.durationMs += day.durationMs
      week.questionCount += day.questionCount
      week.sessionCount += day.sessionCount
    }
  }

  return { today, week }
}
