import { describe, expect, it } from 'vitest'
import type { Question } from '@/types/math'
import { numberToZh, questionToSpeech } from './speech'

const baseQuestion: Question = {
  id: 'speech-q',
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

describe('题目朗读文本', () => {
  it('把常用数字转换成自然中文', () => {
    expect(numberToZh(0)).toBe('零')
    expect(numberToZh(10)).toBe('十')
    expect(numberToZh(18)).toBe('十八')
    expect(numberToZh(20)).toBe('二十')
  })

  it('按空格位置读成“几”', () => {
    expect(questionToSpeech(baseQuestion)).toBe('三加二等于几？')
    expect(
      questionToSpeech({
        ...baseQuestion,
        pattern: 'a-plus-blank-equals-c',
        left: 3,
        right: null,
        result: 5,
      }),
    ).toBe('三加几等于五？')
  })
})
