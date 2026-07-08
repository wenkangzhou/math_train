import { describe, expect, it } from 'vitest'
import { CARRIAGE_CATALOG } from './carriages'

describe('长期机车收藏目录', () => {
  it('全部奖励都是可选择的功能机车', () => {
    expect(CARRIAGE_CATALOG).toHaveLength(14)
    expect(CARRIAGE_CATALOG.every((item) => item.kind === 'head')).toBe(true)
    expect(
      CARRIAGE_CATALOG.some((item) => /数字|小鸭|苹果/.test(item.name)),
    ).toBe(false)
    expect(
      CARRIAGE_CATALOG.every(
        (item) => item.personality.length > 0 && item.description.length > 0,
      ),
    ).toBe(true)
  })

  it('前期快速获得伙伴，后期解锁间距逐步增加', () => {
    const thresholds = CARRIAGE_CATALOG.map((item) => item.unlockAtStars)
    const gaps = thresholds.slice(1).map((value, index) => value - thresholds[index])

    expect(thresholds.slice(0, 4)).toEqual([0, 30, 80, 150])
    expect(thresholds[thresholds.length - 1]).toBe(2520)
    expect(Math.min(...gaps)).toBeGreaterThanOrEqual(30)
    expect(gaps.every((gap, index) => index === 0 || gap >= gaps[index - 1])).toBe(true)
  })
})
