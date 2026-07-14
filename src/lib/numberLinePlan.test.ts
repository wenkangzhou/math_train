import { describe, expect, it } from 'vitest'
import type { Question } from '@/types/math'
import { createNumberLinePlan, numberLineCurrentValue } from './numberLinePlan'

function makeQuestion(partial: Partial<Question>): Question {
  return {
    id: 'q',
    operation: 'addition',
    range: 10,
    pattern: 'a-plus-b-equals-blank',
    left: 3,
    right: 2,
    result: null,
    answer: 5,
    fullLeft: 3,
    fullRight: 2,
    fullResult: 5,
    visualTheme: 'car',
    ...partial,
  }
}

describe('数轴提示规划', () => {
  it('标准加法从左数向右走到答案', () => {
    const plan = createNumberLinePlan(makeQuestion({}))

    expect(plan).toMatchObject({
      start: 3,
      end: 5,
      steps: 2,
      direction: 'right',
      answerKind: 'landing',
    })
    expect(numberLineCurrentValue(plan, 2)).toBe(5)
  })

  it('缺少加法前项时，从总数往左退，不直接站在答案上', () => {
    const plan = createNumberLinePlan(
      makeQuestion({
        pattern: 'blank-plus-b-equals-c',
        left: null,
        right: 2,
        result: 5,
        answer: 3,
        fullLeft: 3,
        fullRight: 2,
        fullResult: 5,
      }),
    )

    expect(plan).toMatchObject({
      start: 5,
      end: 3,
      steps: 2,
      direction: 'left',
      answerKind: 'landing',
    })
    expect(numberLineCurrentValue(plan, 0)).toBe(5)
    expect(numberLineCurrentValue(plan, 2)).toBe(3)
  })

  it('缺少减法前项时，从剩下的数加回去找原来有几个', () => {
    const plan = createNumberLinePlan(
      makeQuestion({
        operation: 'subtraction',
        pattern: 'blank-minus-b-equals-c',
        left: null,
        right: 2,
        result: 3,
        answer: 5,
        fullLeft: 5,
        fullRight: 2,
        fullResult: 3,
      }),
    )

    expect(plan).toMatchObject({
      start: 3,
      end: 5,
      steps: 2,
      direction: 'right',
      answerKind: 'landing',
    })
    expect(numberLineCurrentValue(plan, 0)).toBe(3)
    expect(numberLineCurrentValue(plan, 2)).toBe(5)
  })

  it('缺少右侧数字时，把走了几步作为答案', () => {
    const addPlan = createNumberLinePlan(
      makeQuestion({
        pattern: 'a-plus-blank-equals-c',
        right: null,
        result: 5,
        answer: 2,
        fullLeft: 3,
        fullRight: 2,
        fullResult: 5,
      }),
    )
    const subPlan = createNumberLinePlan(
      makeQuestion({
        operation: 'subtraction',
        pattern: 'a-minus-blank-equals-c',
        left: 5,
        right: null,
        result: 3,
        answer: 2,
        fullLeft: 5,
        fullRight: 2,
        fullResult: 3,
      }),
    )

    expect(addPlan.answerKind).toBe('steps')
    expect(addPlan.steps).toBe(2)
    expect(subPlan.answerKind).toBe('steps')
    expect(subPlan.steps).toBe(2)
  })

  it('19-11 按10和1分成两个大步，不需要逐格点11次', () => {
    const plan = createNumberLinePlan(
      makeQuestion({
        operation: 'subtraction',
        range: 20,
        pattern: 'a-minus-b-equals-blank',
        left: 19,
        right: 11,
        result: null,
        answer: 8,
        fullLeft: 19,
        fullRight: 11,
        fullResult: 8,
      }),
    )

    expect(plan.jumpAmounts).toEqual([10, 1])
    expect(numberLineCurrentValue(plan, plan.jumpAmounts![0])).toBe(9)
    expect(numberLineCurrentValue(plan, plan.steps)).toBe(8)
  })

  it('13-8 先跳到10，再跳完剩下的5格', () => {
    const plan = createNumberLinePlan(
      makeQuestion({
        operation: 'subtraction',
        range: 20,
        pattern: 'a-minus-b-equals-blank',
        left: 13,
        right: 8,
        result: null,
        answer: 5,
        fullLeft: 13,
        fullRight: 8,
        fullResult: 5,
      }),
    )

    expect(plan.jumpAmounts).toEqual([3, 5])
    expect(numberLineCurrentValue(plan, plan.jumpAmounts![0])).toBe(10)
  })
})
