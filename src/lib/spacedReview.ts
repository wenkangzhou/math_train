import type { WrongQuestionRecord, WrongReviewStage } from '@/types/storage'
import { dayDiff, toDateStr, todayStr } from './date'

export const REVIEW_INTERVAL_DAYS = [1, 3, 7] as const

function intervalForStage(stage: WrongReviewStage): number {
  return REVIEW_INTERVAL_DAYS[Math.min(stage, 2) as 0 | 1 | 2]
}

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00`)
  date.setDate(date.getDate() + days)
  return toDateStr(date)
}

function dateKeyFromIso(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : toDateStr(date)
}

function clampStage(value: unknown): WrongReviewStage {
  const stage = Number(value)
  if (!Number.isFinite(stage)) return 0
  return Math.min(3, Math.max(0, Math.floor(stage))) as WrongReviewStage
}

export function normalizeWrongReviewRecord(
  record: WrongQuestionRecord,
  now = new Date(),
): WrongQuestionRecord {
  const fallbackToday = toDateStr(now)
  const legacyStage = record.mastered
    ? 3
    : clampStage(record.correctCountAfterWrong)
  const reviewStage = record.mastered
    ? 3
    : clampStage(record.reviewStage ?? legacyStage)
  const baseDate = isDateKey(record.lastReviewDate)
    ? record.lastReviewDate
    : dateKeyFromIso(record.lastPracticedAt || record.createdAt, fallbackToday)
  const nextReviewAt = reviewStage >= 3
    ? ''
    : isDateKey(record.nextReviewAt)
      ? record.nextReviewAt
      : addDays(baseDate, intervalForStage(reviewStage))

  return {
    ...record,
    correctCountAfterWrong: reviewStage,
    reviewStage,
    nextReviewAt,
    lastReviewDate: isDateKey(record.lastReviewDate) ? record.lastReviewDate : '',
    mastered: reviewStage >= 3,
  }
}

export function isReviewDue(
  record: WrongQuestionRecord,
  today = todayStr(),
): boolean {
  return !record.mastered && Boolean(record.nextReviewAt) && record.nextReviewAt <= today
}

export function daysUntilReview(
  record: WrongQuestionRecord,
  today = todayStr(),
): number {
  if (record.mastered || !record.nextReviewAt) return 0
  return Math.max(0, dayDiff(today, record.nextReviewAt))
}

export function applySpacedReviewResult(
  record: WrongQuestionRecord,
  success: boolean,
  now = new Date(),
): void {
  const today = toDateStr(now)
  const nowIso = now.toISOString()
  record.lastPracticedAt = nowIso

  if (!success) {
    record.reviewStage = 0
    record.correctCountAfterWrong = 0
    record.mastered = false
    record.lastReviewDate = today
    record.nextReviewAt = addDays(today, REVIEW_INTERVAL_DAYS[0])
    return
  }

  if (record.mastered || !isReviewDue(record, today)) return

  const nextStage = Math.min(3, record.reviewStage + 1) as WrongReviewStage
  record.reviewStage = nextStage
  record.correctCountAfterWrong = nextStage
  record.lastReviewDate = today
  record.mastered = nextStage >= 3
  record.nextReviewAt = record.mastered
    ? ''
    : addDays(today, intervalForStage(nextStage))
}

export function createWrongReviewSchedule(now = new Date()): Pick<
  WrongQuestionRecord,
  'correctCountAfterWrong' | 'reviewStage' | 'nextReviewAt' | 'lastReviewDate' | 'mastered'
> {
  const today = toDateStr(now)
  return {
    correctCountAfterWrong: 0,
    reviewStage: 0,
    nextReviewAt: addDays(today, REVIEW_INTERVAL_DAYS[0]),
    lastReviewDate: today,
    mastered: false,
  }
}
