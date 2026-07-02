import { describe, expect, it } from 'vitest'
import type { Question } from '@/types/math'
import {
  alternateHintMethod,
  objectHintMode,
  recommendedHintMethod,
} from './hintStrategy'

const addition: Question = {
  id: 'hint-add',
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
}

describe('儿童辅助推荐', () => {
  it('10以内先用具体物品，连续答错两次后再推荐数轴', () => {
    expect(recommendedHintMethod(addition, 0)).toBe('objects')
    expect(recommendedHintMethod(addition, 1)).toBe('objects')
    expect(recommendedHintMethod(addition, 2)).toBe('numberline')
  })

  it('20以内直接推荐小火车数轴', () => {
    expect(recommendedHintMethod({ ...addition, range: 20 }, 0)).toBe(
      'numberline',
    )
  })

  it('缺项题与减法使用可操作的摆一摆', () => {
    expect(objectHintMode(addition)).toBe('picture')
    expect(
      objectHintMode({
        ...addition,
        pattern: 'a-plus-blank-equals-c',
        right: null,
        result: 5,
      }),
    ).toBe('manipulative')
    expect(
      objectHintMode({
        ...addition,
        operation: 'subtraction',
        pattern: 'a-minus-b-equals-blank',
      }),
    ).toBe('manipulative')
  })

  it('换个方法只在具体物品与数轴之间切换', () => {
    expect(alternateHintMethod('objects')).toBe('numberline')
    expect(alternateHintMethod('numberline')).toBe('objects')
  })
})
