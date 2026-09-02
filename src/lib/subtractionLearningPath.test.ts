import { describe, expect, it } from 'vitest'
import type { PracticeHistoryItem } from '@/types/storage'
import type { PracticeSettings, SubtractionLearningStageId } from '@/types/math'
import { generateQuestions } from './questionGenerator'
import {
  isSubtractionPathEligible,
  nextSubtractionStage,
  settingsForSubtractionStage,
  skillSequenceForSubtractionStage,
} from './subtractionLearningPath'

const BASE: PracticeSettings & {
  questionFormats: ['equation']
  skillTags: []
  adaptiveDifficulty: false
} = {
  selectedRanges: ['subtraction-within-20'],
  selectedPatterns: ['a-minus-b-equals-blank'],
  questionCount: 10,
  autoShowVisualHint: false,
  showHintAfterWrongAnswer: true,
  questionFormats: ['equation'],
  skillTags: [],
  adaptiveDifficulty: false,
}

function history(
  id: string,
  stage: SubtractionLearningStageId,
  accuracy = 1,
  hints = 0,
  attempts = 5,
): PracticeHistoryItem {
  return {
    id,
    profileId: 'p1',
    startedAt: '2026-09-01T08:00:00.000Z',
    completedAt: '2026-09-01T08:02:00.000Z',
    settings: { ...BASE, questionCount: 5, subtractionLearningStage: stage },
    totalQuestions: 5,
    correctQuestions: Math.round(accuracy * 5),
    accuracy,
    totalAttempts: attempts,
    hintCount: hints,
    averageDurationMs: 10_000,
    bestStreak: 5,
    earnedStars: 5,
    difficultyStart: 'add10-basic',
    difficultyEnd: 'add10-basic',
    sessionKind: 'regular',
  }
}

describe('20以内减法学习路线', () => {
  it('只在手动20以内标准减法、且未选择专项时启用', () => {
    expect(isSubtractionPathEligible(BASE)).toBe(true)
    expect(isSubtractionPathEligible({ ...BASE, adaptiveDifficulty: true })).toBe(false)
    expect(isSubtractionPathEligible({ ...BASE, skillTags: ['sub20-borrow'] })).toBe(false)
    expect(isSubtractionPathEligible({
      ...BASE,
      selectedPatterns: ['a-minus-blank-equals-c'],
    })).toBe(false)
  })

  it('每关固定5题，第一关自动打开提示，后续默认收起', () => {
    const first = settingsForSubtractionStage(BASE, 'take-ones')
    const second = settingsForSubtractionStage(BASE, 'break-ten')
    expect(first.questionCount).toBe(5)
    expect(first.autoShowVisualHint).toBe(true)
    expect(second.autoShowVisualHint).toBe(false)
    expect(second.questionFormats).toEqual(['equation'])
  })

  it('前三关只生成对应方法，混合关一趟覆盖三种方法', () => {
    for (const stage of ['take-ones', 'break-ten', 'take-ten'] as const) {
      const settings = settingsForSubtractionStage(BASE, stage)
      const questions = generateQuestions({
        ...settings,
        skillSequence: skillSequenceForSubtractionStage(stage, 5),
      })
      expect(questions).toHaveLength(5)
      expect(new Set(questions.map((question) => question.skill)).size).toBe(1)
      expect(questions.every((question) => question.operation === 'subtraction')).toBe(true)
      expect(questions.every((question) => question.pattern === 'a-minus-b-equals-blank')).toBe(true)
      if (stage === 'take-ten') {
        expect(questions.every((question) => question.fullRight >= 10)).toBe(true)
      }
    }

    const mixed = settingsForSubtractionStage(BASE, 'mixed')
    const questions = generateQuestions({
      ...mixed,
      skillSequence: skillSequenceForSubtractionStage('mixed', 5),
    })
    expect(new Set(questions.map((question) => question.skill))).toEqual(new Set([
      'sub20-teen-minus-unit',
      'sub20-break-ten',
      'sub20-take-ten',
    ]))
  })

  it('连续两趟达到标准才晋级，单趟或提示依赖较高时留在原关', () => {
    expect(nextSubtractionStage('take-ones', [history('1', 'take-ones')]))
      .toBe('take-ones')
    expect(nextSubtractionStage('take-ones', [
      history('2', 'take-ones', 0.8, 5, 7),
      history('1', 'take-ones', 1, 5, 5),
    ])).toBe('break-ten')
    expect(nextSubtractionStage('break-ten', [
      history('2', 'break-ten', 1, 4),
      history('1', 'break-ten', 1, 4),
    ])).toBe('break-ten')
  })
})
