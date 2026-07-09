import { describe, it, expect } from 'vitest'
import {
  generateQuestion,
  generateQuestions,
  patternOperation,
  rangeMax,
  rangeOperation,
  ADDITION_PATTERNS,
  SUBTRACTION_PATTERNS,
} from './questionGenerator'
import { isValidQuestion, checkAnswer } from './questionValidator'
import type {
  PracticeSettings,
  QuestionPattern,
  RangeType,
} from '@/types/math'

const ALL_PATTERNS: QuestionPattern[] = [
  ...ADDITION_PATTERNS,
  ...SUBTRACTION_PATTERNS,
]

const ALL_RANGES: RangeType[] = [
  'addition-within-10',
  'subtraction-within-10',
  'addition-within-20',
  'subtraction-within-20',
]

describe('range helpers', () => {
  it('maps range to operation and max', () => {
    expect(rangeOperation('addition-within-10')).toBe('addition')
    expect(rangeOperation('subtraction-within-20')).toBe('subtraction')
    expect(rangeMax('addition-within-10')).toBe(10)
    expect(rangeMax('subtraction-within-20')).toBe(20)
  })
})

describe('generateQuestion — per pattern correctness', () => {
  for (const pattern of ALL_PATTERNS) {
    const op = patternOperation(pattern)
    const ranges: RangeType[] =
      op === 'addition'
        ? ['addition-within-20']
        : ['subtraction-within-20']

    it(`pattern ${pattern}: 1000 samples are all valid`, () => {
      for (let i = 0; i < 1000; i++) {
        const q = generateQuestion({ ranges, patterns: [pattern] })
        expect(q.pattern).toBe(pattern)
        expect(q.operation).toBe(op)
        // 等式与挖空一致
        expect(isValidQuestion(q)).toBe(true)
        // 正确答案能通过校验
        expect(checkAnswer(q, q.answer)).toBe(true)
        // 恰好一个挖空位
        const blanks = [q.left, q.right, q.result].filter((n) => n === null)
        expect(blanks.length).toBe(1)
      }
    })
  }
})

describe('boundary conditions — never negative, never exceed range', () => {
  for (const range of ALL_RANGES) {
    const op = rangeOperation(range)
    const max = rangeMax(range)
    const patterns = op === 'addition' ? ADDITION_PATTERNS : SUBTRACTION_PATTERNS

    it(`${range}: numbers stay within [0, ${max}] and answers are non-negative`, () => {
      for (let i = 0; i < 2000; i++) {
        const q = generateQuestion({ ranges: [range], patterns })
        expect(q.fullLeft).toBeGreaterThanOrEqual(0)
        expect(q.fullRight).toBeGreaterThanOrEqual(0)
        expect(q.fullResult).toBeGreaterThanOrEqual(0)
        expect(q.fullLeft).toBeLessThanOrEqual(max)
        expect(q.fullRight).toBeLessThanOrEqual(max)
        expect(q.fullResult).toBeLessThanOrEqual(max)
        expect(q.answer).toBeGreaterThanOrEqual(0)
        expect(q.answer).toBeLessThanOrEqual(max)
        if (op === 'subtraction') {
          // 被减数 >= 减数
          expect(q.fullLeft).toBeGreaterThanOrEqual(q.fullRight)
        }
      }
    })
  }
})

describe('generateQuestions — full set', () => {
  const baseSettings: PracticeSettings = {
    selectedRanges: ALL_RANGES,
    selectedPatterns: ALL_PATTERNS,
    questionCount: 20,
    autoShowVisualHint: false,
    showHintAfterWrongAnswer: true,
  }

  it('produces the requested count', () => {
    for (const count of [5, 10, 20] as const) {
      const qs = generateQuestions({ ...baseSettings, questionCount: count })
      expect(qs.length).toBe(count)
    }
  })

  it('all questions valid and answers checkable', () => {
    const qs = generateQuestions(baseSettings)
    for (const q of qs) {
      expect(isValidQuestion(q)).toBe(true)
      expect(checkAnswer(q, q.answer)).toBe(true)
    }
  })

  it('avoids identical consecutive number+pattern signatures', () => {
    // 运行多套，统计相邻完全相同的比例应为 0
    for (let run = 0; run < 50; run++) {
      const qs = generateQuestions(baseSettings)
      for (let i = 1; i < qs.length; i++) {
        const a = qs[i - 1]
        const b = qs[i]
        const same =
          a.fullLeft === b.fullLeft &&
          a.fullRight === b.fullRight &&
          a.operation === b.operation &&
          a.pattern === b.pattern
        expect(same).toBe(false)
      }
    }
  })

  it('respects user-selected patterns only', () => {
    const onlyBlankPlus: PracticeSettings = {
      ...baseSettings,
      selectedRanges: ['addition-within-10'],
      selectedPatterns: ['a-plus-blank-equals-c'],
      questionCount: 20,
    }
    const qs = generateQuestions(onlyBlankPlus)
    for (const q of qs) {
      expect(q.pattern).toBe('a-plus-blank-equals-c')
    }
  })

  it('mixes operations when only one range is selected', () => {
    const subOnly: PracticeSettings = {
      ...baseSettings,
      selectedRanges: ['subtraction-within-10'],
      selectedPatterns: SUBTRACTION_PATTERNS,
      questionCount: 20,
    }
    const qs = generateQuestions(subOnly)
    for (const q of qs) {
      expect(q.operation).toBe('subtraction')
      expect(q.range).toBe(10)
    }
  })

  it('adds picture-book metadata for picture and story formats', () => {
    const qs = generateQuestions({
      ...baseSettings,
      questionCount: 10,
      questionFormats: ['picture', 'story'],
    })

    for (const q of qs) {
      expect(['picture', 'story']).toContain(q.format)
      expect(q.story).toBeTruthy()
      expect(q.storyActor).toBeTruthy()
      expect(q.storyTitle).toBeTruthy()
      expect(q.storyScene).toBeTruthy()
    }
  })
})
