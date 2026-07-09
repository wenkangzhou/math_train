import { describe, expect, it } from 'vitest'
import type { Question } from '@/types/math'
import { VISUAL_THEMES } from './visualTheme'
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
    expect(first.storyLine).toContain(first.actor)
    expect(first.decorations.length).toBeGreaterThanOrEqual(3)
  })

  it('每个视觉主题都有绘本场景素材', () => {
    for (const { theme } of VISUAL_THEMES) {
      const scene = getPictureBookScene(makeQuestion({ id: `theme-${theme}`, visualTheme: theme }))

      expect(scene.sceneName).toBeTruthy()
      expect(scene.sceneEmoji).toBeTruthy()
      expect(scene.helperLine.length).toBeGreaterThan(8)
      expect(scene.storyLine).toContain(scene.actor)
      expect(scene.decorations.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('同一主题能稳定切换不同小场景，减少重复感', () => {
    const sceneNames = new Set(
      Array.from({ length: 24 }, (_, index) =>
        getPictureBookScene(makeQuestion({ id: `car-scene-${index}`, visualTheme: 'car' })).sceneName,
      ),
    )

    expect(sceneNames.size).toBeGreaterThan(1)
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
      const scene = getPictureBookScene(q)

      expect(text.length).toBeGreaterThan(10)
      expect(text).toMatch(/[？?]/)
      expect(text).toContain(scene.sceneName)
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
