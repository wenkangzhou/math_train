import { describe, expect, it } from 'vitest'
import type { Question } from '@/types/math'
import {
  estimateTripsRemaining,
  getEarnedStars,
  getQuestionWeight,
  sumWeightedStars,
} from './starWeights'

const baseQuestion: Question = {
  id: 'star-q',
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
  visualTheme: 'star',
}

describe('难度星星', () => {
  it('按范围、运算和题型给出 1 到 5 星', () => {
    expect(getQuestionWeight(baseQuestion)).toBe(1)
    expect(
      getQuestionWeight({
        ...baseQuestion,
        operation: 'subtraction',
        pattern: 'a-minus-b-equals-blank',
      }),
    ).toBe(2)
    expect(getQuestionWeight({ ...baseQuestion, range: 20 })).toBe(2)
    expect(
      getQuestionWeight({
        ...baseQuestion,
        operation: 'subtraction',
        range: 20,
        pattern: 'blank-minus-b-equals-c',
      }),
    ).toBe(5)
  })

  it('首次答对拿完整难度星，重试做对保留一颗坚持星', () => {
    const hardQuestion: Question = {
      ...baseQuestion,
      operation: 'subtraction',
      range: 20,
      pattern: 'blank-minus-b-equals-c',
    }
    expect(getEarnedStars(hardQuestion, true)).toBe(5)
    expect(getEarnedStars(hardQuestion, false)).toBe(1)
  })

  it('汇总每道题实际获得的星星', () => {
    expect(
      sumWeightedStars([
        { questionStarWeight: 1 },
        { questionStarWeight: 3 },
        { questionStarWeight: undefined },
      ]),
    ).toBe(4)
  })

  it('根据最近平均收益估算还要完成多少趟', () => {
    expect(estimateTripsRemaining(30, 10)).toBe(3)
    expect(estimateTripsRemaining(31, 10)).toBe(4)
    expect(estimateTripsRemaining(0, 10)).toBe(0)
  })
})
