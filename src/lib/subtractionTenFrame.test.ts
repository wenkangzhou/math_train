import { describe, expect, it } from 'vitest'
import type { Question, QuestionPattern } from '@/types/math'
import {
  createSubtractionTenFramePlan,
  remainingAfterStep,
  removedIndexesAfterStep,
  supportsSubtractionTenFrame,
} from './subtractionTenFrame'

function subtraction(
  left: number,
  right: number,
  pattern: QuestionPattern = 'a-minus-b-equals-blank',
): Question {
  const result = left - right
  return {
    id: `${left}-${right}-${pattern}`,
    operation: 'subtraction',
    range: 20,
    pattern,
    left: pattern === 'blank-minus-b-equals-c' ? null : left,
    right: pattern === 'a-minus-blank-equals-c' ? null : right,
    result: pattern === 'a-minus-b-equals-blank' ? null : result,
    answer:
      pattern === 'a-minus-blank-equals-c'
        ? right
        : pattern === 'blank-minus-b-equals-c'
          ? left
          : result,
    fullLeft: left,
    fullRight: right,
    fullResult: result,
    visualTheme: 'apple',
  }
}

describe('20以内减法十格图', () => {
  it('19-11 先拿走一整组10，再拿走1，最后仍能看见8个', () => {
    const plan = createSubtractionTenFramePlan(subtraction(19, 11))

    expect(plan.strategy).toBe('take-ten-first')
    expect(plan.steps.map((step) => step.amount)).toEqual([10, 1])
    expect(plan.steps.map((step) => step.equation)).toEqual([
      '19 − 10 = 9',
      '9 − 1 = 8',
    ])
    expect(remainingAfterStep(plan, 1)).toBe(9)
    expect(remainingAfterStep(plan, 2)).toBe(8)
    expect(removedIndexesAfterStep(plan, 2)).toHaveLength(11)
  })

  it('13-8 使用破十法：10-8 后再和3合起来', () => {
    const plan = createSubtractionTenFramePlan(subtraction(13, 8))

    expect(plan.strategy).toBe('break-ten')
    expect(plan.steps.map((step) => step.equation)).toEqual([
      '10 − 8 = 2',
      '2 + 3 = 5',
    ])
    expect(remainingAfterStep(plan, plan.steps.length)).toBe(5)
    expect(removedIndexesAfterStep(plan, plan.steps.length)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7,
    ])
  })

  it('17-5 只从个位组拿走，完整的10保持不动', () => {
    const plan = createSubtractionTenFramePlan(subtraction(17, 5))

    expect(plan.strategy).toBe('take-ones')
    expect(plan.steps[0].removeIndexes).toEqual([10, 11, 12, 13, 14])
    expect(plan.steps.map((step) => step.equation)).toEqual([
      '7 − 5 = 2',
      '10 + 2 = 12',
    ])
  })

  it('20-6 从第二个完整十格里拿走6个', () => {
    const plan = createSubtractionTenFramePlan(subtraction(20, 6))

    expect(plan.strategy).toBe('take-ones')
    expect(plan.secondGroupCount).toBe(10)
    expect(plan.steps[0].removeIndexes).toEqual([10, 11, 12, 13, 14, 15])
    expect(remainingAfterStep(plan, plan.steps.length)).toBe(14)
  })

  it('支持求差和求减数，不把求被减数题硬套进拿走模型', () => {
    expect(supportsSubtractionTenFrame(subtraction(19, 11))).toBe(true)
    expect(
      supportsSubtractionTenFrame(
        subtraction(19, 11, 'a-minus-blank-equals-c'),
      ),
    ).toBe(true)
    expect(
      supportsSubtractionTenFrame(
        subtraction(19, 11, 'blank-minus-b-equals-c'),
      ),
    ).toBe(false)
  })
})
