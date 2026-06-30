import { describe, expect, it } from 'vitest'
import type { PracticeHistoryItem } from '@/types/storage'
import { DEFAULT_PROFILE_SETTINGS } from './defaults'
import {
  groupPracticeHistory,
  practiceSessionDurationMs,
  summarizePracticeHistory,
} from './practiceHistory'

function session(
  id: string,
  start: Date,
  durationMinutes: number,
  questions: number,
): PracticeHistoryItem {
  return {
    id,
    profileId: 'p1',
    startedAt: start.toISOString(),
    completedAt: new Date(start.getTime() + durationMinutes * 60_000).toISOString(),
    settings: DEFAULT_PROFILE_SETTINGS,
    totalQuestions: questions,
    correctQuestions: questions,
    accuracy: 1,
    totalAttempts: questions,
    hintCount: 0,
    averageDurationMs: durationMinutes * 60_000 / questions,
    bestStreak: questions,
    earnedStars: questions,
    difficultyStart: '',
    difficultyEnd: '',
  }
}

describe('答题记录汇总', () => {
  it('按本地日期统计今天和本周累计时间、题数', () => {
    const now = new Date(2026, 6, 1, 20, 0)
    const records = [
      session('today', new Date(2026, 6, 1, 10, 0), 5, 5),
      session('monday', new Date(2026, 5, 29, 10, 0), 10, 10),
      session('last-week', new Date(2026, 5, 28, 10, 0), 7, 7),
    ]

    const summary = summarizePracticeHistory(records, now)

    expect(summary.today).toEqual({
      durationMs: 5 * 60_000,
      questionCount: 5,
      sessionCount: 1,
    })
    expect(summary.week).toEqual({
      durationMs: 15 * 60_000,
      questionCount: 15,
      sessionCount: 2,
    })
  })

  it('按天分组并使用平均题时兜底旧记录', () => {
    const record = session('legacy', new Date(2026, 5, 30, 10, 0), 2, 4)
    record.completedAt = record.startedAt
    record.averageDurationMs = 30_000

    expect(practiceSessionDurationMs(record)).toBe(120_000)
    const groups = groupPracticeHistory([record])
    expect(groups).toHaveLength(1)
    expect(groups[0].questionCount).toBe(4)
    expect(groups[0].durationMs).toBe(120_000)
  })
})
