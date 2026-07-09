import { describe, expect, it } from 'vitest'
import type { Question } from '@/types/math'
import {
  enrichPictureBookQuestion,
  getPictureBookScene,
  pictureBookQuestionText,
} from './pictureBook'

function makeQuestion(partial: Partial<Question>): Question {
  return {
    id: 'pic-book-q',
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
    visualTheme: 'apple',
    ...partial,
  }
}

describe('绘本题素材', () => {
  it('为题目稳定生成场景、主角和标题', () => {
    const q = makeQuestion({})
    const first = getPictureBookScene(q)
    const second = getPictureBookScene(q)

    expect(first).toEqual(second)
    expect(first.title).toContain(first.sceneName)
    expect(first.actor).toBeTruthy()
    expect(first.itemEmoji).toBe('🍎')
  })

  it('所有题型都有儿童化故事提问', () => {
    const patterns: Array<Question['pattern']> = [
      'a-plus-b-equals-blank',
      'a-plus-blank-equals-c',
      'blank-plus-b-equals-c',
      'a-minus-b-equals-blank',
      'a-minus-blank-equals-c',
      'blank-minus-b-equals-c',
    ]

    for (const pattern of patterns) {
      const q = makeQuestion({
        operation: pattern.includes('minus') ? 'subtraction' : 'addition',
        pattern,
        left: pattern.startsWith('blank') ? null : 5,
        right: pattern.includes('blank-equals') ? null : 2,
        result: pattern.endsWith('blank') ? null : 3,
        answer: pattern.startsWith('blank') ? 5 : pattern.includes('blank-equals') ? 2 : 3,
        fullLeft: 5,
        fullRight: 2,
        fullResult: pattern.includes('minus') ? 3 : 7,
      })
      const text = pictureBookQuestionText(q)

      expect(text.length).toBeGreaterThan(10)
      expect(text).toMatch(/[？?]/)
    }
  })

  it('能把绘本信息写回题目，供图片题和故事题共用', () => {
    const q = enrichPictureBookQuestion(makeQuestion({ visualTheme: 'duck' }))

    expect(q.story).toBeTruthy()
    expect(q.storyActor).toBeTruthy()
    expect(q.storyTitle).toBeTruthy()
    expect(q.storyScene).toBeTruthy()
  })
})
