import { describe, expect, it } from 'vitest'
import type { Question, QuestionPattern } from '@/types/math'
import {
  createAdditionTenFramePlan,
  placedIndexesAfterStep,
  remainingAddendsAfterStep,
  supportsAdditionTenFrame,
} from './additionTenFrame'

function addition(
  left: number,
  right: number,
  pattern: QuestionPattern = 'a-plus-b-equals-blank',
): Question {
  const result = left + right
  return {
    id: `${left}+${right}-${pattern}`,
    operation: 'addition',
    range: 20,
    pattern,
    left: pattern === 'blank-plus-b-equals-c' ? null : left,
    right: pattern === 'a-plus-blank-equals-c' ? null : right,
    result: pattern === 'a-plus-b-equals-blank' ? null : result,
    answer:
      pattern === 'a-plus-blank-equals-c'
        ? right
        : pattern === 'blank-plus-b-equals-c'
          ? left
          : result,
    fullLeft: left,
    fullRight: right,
    fullResult: result,
    visualTheme: 'apple',
  }
}

describe('20以内加法十格图', () => {
  it('8+7 把7拆成2和5，先凑十再放剩余', () => {
    const plan = createAdditionTenFramePlan(addition(8, 7))

    expect(plan.strategy).toBe('make-ten')
    expect(plan.steps.map((step) => step.amount)).toEqual([2, 5])
    expect(plan.steps.map((step) => step.equation)).toEqual([
      '8 + 2 = 10',
      '10 + 5 = 15',
    ])
    expect(remainingAddendsAfterStep(plan, 1)).toBe(5)
    expect(remainingAddendsAfterStep(plan, 2)).toBe(0)
    expect(placedIndexesAfterStep(plan, 2)).toEqual([8, 9, 10, 11, 12, 13, 14])
  })

  it('13+5 保留完整的10，只合并个位', () => {
    const plan = createAdditionTenFramePlan(addition(13, 5))

    expect(plan.strategy).toBe('teen-plus')
    expect(plan.steps.map((step) => step.equation)).toEqual([
      '3 + 5 = 8',
      '10 + 8 = 18',
    ])
    expect(plan.steps[0].placedIndexes).toEqual([13, 14, 15, 16, 17])
  })

  it('3+12 会把较大的12放前面，减少操作数量', () => {
    const plan = createAdditionTenFramePlan(addition(3, 12))

    expect(plan.base).toBe(12)
    expect(plan.add).toBe(3)
    expect(plan.swapped).toBe(true)
    expect(plan.steps[0].equation).toBe('2 + 3 = 5')
  })

  it('10+6 直接保留完整十格，只需要加入一次', () => {
    const plan = createAdditionTenFramePlan(addition(10, 6))

    expect(plan.strategy).toBe('ten-plus')
    expect(plan.steps).toHaveLength(1)
    expect(plan.steps[0].equation).toBe('10 + 6 = 16')
  })

  it('缺少右侧加数时，最终答案是累计加入的数量', () => {
    const plan = createAdditionTenFramePlan(
      addition(8, 7, 'a-plus-blank-equals-c'),
    )

    expect(plan.answerKind).toBe('added')
    expect(plan.add).toBe(7)
    expect(plan.done).toContain('空格要填 7')
  })

  it('缺少左侧加数时，以已知的右侧加数作为起点', () => {
    const plan = createAdditionTenFramePlan(
      addition(8, 7, 'blank-plus-b-equals-c'),
    )

    expect(plan.base).toBe(7)
    expect(plan.add).toBe(8)
    expect(plan.steps.map((step) => step.amount)).toEqual([3, 5])
  })

  it('总数不超过10或加0时不强行使用凑十法', () => {
    expect(supportsAdditionTenFrame(addition(4, 5))).toBe(false)
    expect(supportsAdditionTenFrame(addition(15, 0))).toBe(false)
    expect(supportsAdditionTenFrame(addition(8, 7))).toBe(true)
  })
})
