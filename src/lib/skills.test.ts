import { describe, it, expect } from 'vitest'
import {
  SKILL_META,
  skillEquations,
  genEquationForSkill,
} from './skills'
import type { SkillTag } from '@/types/math'

const ALL = Object.keys(SKILL_META) as SkillTag[]
const ones = (n: number) => n % 10

describe('难度细分技能生成器', () => {
  it('每个技能都有候选等式，且数字不越界、减法不为负', () => {
    for (const tag of ALL) {
      const list = skillEquations(tag)
      expect(list.length, `${tag} 应有候选`).toBeGreaterThan(0)
      for (const e of list) {
        expect(e.left).toBeGreaterThanOrEqual(0)
        expect(e.right).toBeGreaterThanOrEqual(0)
        expect(e.result).toBeGreaterThanOrEqual(0)
        expect(Math.max(e.left, e.right, e.result)).toBeLessThanOrEqual(20)
        if (SKILL_META[tag].op === 'addition') {
          expect(e.left + e.right).toBe(e.result)
        } else {
          expect(e.left - e.right).toBe(e.result)
        }
      }
    }
  })

  it('进位加法：个位相加一定 ≥ 10', () => {
    for (const e of skillEquations('add20-carry')) {
      expect(ones(e.left) + ones(e.right)).toBeGreaterThanOrEqual(10)
    }
  })

  it('不进位加法：个位相加一定 ≤ 9，且和 > 10', () => {
    for (const e of skillEquations('add20-no-carry')) {
      expect(ones(e.left) + ones(e.right)).toBeLessThanOrEqual(9)
      expect(e.result).toBeGreaterThan(10)
    }
  })

  it('退位减法：被减数个位 < 减数', () => {
    for (const e of skillEquations('sub20-borrow')) {
      expect(ones(e.left)).toBeLessThan(e.right)
    }
  })

  it('不退位减法：被减数个位 ≥ 减数个位', () => {
    for (const e of skillEquations('sub20-no-borrow')) {
      expect(ones(e.left)).toBeGreaterThanOrEqual(ones(e.right))
    }
  })

  it('凑 10 / 凑 5：和精确等于目标', () => {
    for (const e of skillEquations('add10-make10')) expect(e.result).toBe(10)
    for (const e of skillEquations('add10-make5')) expect(e.result).toBe(5)
  })

  it('5 以内加法：和不超过 5', () => {
    for (const e of skillEquations('add10-within5')) expect(e.result).toBeLessThanOrEqual(5)
  })

  it('genEquationForSkill 多次取样都满足技能约束', () => {
    for (let i = 0; i < 50; i++) {
      const e = genEquationForSkill('sub20-borrow')
      expect(ones(e.left)).toBeLessThan(e.right)
      expect(e.result).toBeGreaterThanOrEqual(0)
    }
  })
})
