import { describe, expect, it } from 'vitest'
import type { PracticeHistoryItem } from '@/types/storage'
import type { PracticeSettings } from '@/types/math'
import {
  nextAdaptiveLevel,
  settingsForDifficulty,
} from './adaptiveDifficulty'

const BASE_SETTINGS: PracticeSettings & {
  adaptiveDifficulty: boolean
  allowHarder: boolean
  skillTags: ['add20-carry']
} = {
  selectedRanges: ['addition-within-20'],
  selectedPatterns: ['a-plus-b-equals-blank'],
  questionCount: 10,
  autoShowVisualHint: false,
  showHintAfterWrongAnswer: true,
  adaptiveDifficulty: true,
  allowHarder: false,
  skillTags: ['add20-carry'],
}

function session(
  id: string,
  accuracy: number,
  hints = 0,
  attempts = 10,
  kind: 'regular' | 'review' = 'regular',
): PracticeHistoryItem {
  return {
    id,
    profileId: 'p1',
    startedAt: '2026-07-01T08:00:00.000Z',
    completedAt: '2026-07-01T08:05:00.000Z',
    settings: BASE_SETTINGS,
    totalQuestions: 10,
    correctQuestions: Math.round(accuracy * 10),
    accuracy,
    totalAttempts: attempts,
    hintCount: hints,
    averageDurationMs: 30_000,
    bestStreak: 5,
    earnedStars: Math.round(accuracy * 10),
    difficultyStart: 'add10-basic',
    difficultyEnd: 'add10-basic',
    sessionKind: kind,
  }
}

describe('自动难度调节', () => {
  it('关闭20以内进阶时会把当前练习控制在10以内', () => {
    const adjusted = settingsForDifficulty(BASE_SETTINGS, 'within20-steady')

    expect(adjusted.selectedRanges).toEqual(['addition-within-10'])
    expect(adjusted.selectedPatterns).toEqual(['a-plus-b-equals-blank'])
    expect(adjusted.skillTags).toEqual([])
  })

  it('允许进阶后可进入20以内并自动加入缺项题', () => {
    const adjusted = settingsForDifficulty(
      { ...BASE_SETTINGS, allowHarder: true },
      'within20-missing',
    )

    expect(adjusted.selectedRanges).toEqual(['addition-within-20'])
    expect(adjusted.selectedPatterns).toEqual([
      'a-plus-b-equals-blank',
      'a-plus-blank-equals-c',
      'blank-plus-b-equals-c',
    ])
  })

  it('连续两趟轻松完成才升一级', () => {
    expect(nextAdaptiveLevel('add10-basic', [session('a', 1)], BASE_SETTINGS))
      .toBe('add10-basic')
    expect(nextAdaptiveLevel(
      'add10-basic',
      [session('b', 0.9), session('a', 1)],
      BASE_SETTINGS,
    )).toBe('within10-steady')
  })

  it('明显吃力时退一级，错题复习不参与判断', () => {
    expect(nextAdaptiveLevel(
      'within10-missing',
      [session('weak', 0.5)],
      BASE_SETTINGS,
    )).toBe('within10-steady')

    expect(nextAdaptiveLevel(
      'within10-missing',
      [session('review', 0.2, 8, 24, 'review'), session('regular', 0.8)],
      BASE_SETTINGS,
    )).toBe('within10-missing')
  })
})
