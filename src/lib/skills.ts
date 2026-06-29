// 数数小火车 / Math Train — 难度细分技能（PRD 功能四）
// 每个 SkillTag 对应一个约束化的等式生成器（凑十/破十/进退位等）。
// 用「枚举所有合法 (a,b) 再随机取」的方式，保证产出一定合法、不死循环。

import type { Operation, SkillTag } from '@/types/math'

export interface Equation {
  left: number
  right: number
  result: number
}

export type SkillGroup = 'add10' | 'sub10' | 'add20' | 'sub20'

interface SkillMeta {
  label: string
  group: SkillGroup
  op: Operation
  range: 10 | 20
  // (a, b, result) → 是否满足该技能
  add?: (a: number, b: number, s: number) => boolean
  sub?: (a: number, b: number, r: number) => boolean
}

const ones = (n: number) => n % 10

export const SKILL_META: Record<SkillTag, SkillMeta> = {
  // —— 10 以内加法 ——
  'add10-within5': { label: '5 以内加法', group: 'add10', op: 'addition', range: 10, add: (a, b, s) => a >= 1 && b >= 1 && s <= 5 },
  'add10-no-zero': { label: '10 以内（不含 0）', group: 'add10', op: 'addition', range: 10, add: (a, b, s) => a >= 1 && b >= 1 && s <= 10 },
  'add10-with-zero': { label: '10 以内（含 0）', group: 'add10', op: 'addition', range: 10, add: (a, b, s) => (a === 0 || b === 0) && s >= 1 && s <= 10 },
  'add10-make5': { label: '凑 5', group: 'add10', op: 'addition', range: 10, add: (a, b, s) => a >= 1 && b >= 1 && s === 5 },
  'add10-make10': { label: '凑 10', group: 'add10', op: 'addition', range: 10, add: (a, b, s) => a >= 1 && b >= 1 && s === 10 },

  // —— 10 以内减法 ——
  'sub10-within5': { label: '5 以内减法', group: 'sub10', op: 'subtraction', range: 10, sub: (a, b, r) => a <= 5 && b >= 1 && r >= 0 },
  'sub10-basic': { label: '10 以内减法', group: 'sub10', op: 'subtraction', range: 10, sub: (a, b, r) => a <= 10 && b >= 1 && r >= 1 },
  'sub10-result-zero': { label: '结果为 0', group: 'sub10', op: 'subtraction', range: 10, sub: (a, _b, r) => a >= 1 && a <= 10 && r === 0 },
  'sub10-minus-zero': { label: '减去 0', group: 'sub10', op: 'subtraction', range: 10, sub: (a, b) => b === 0 && a >= 1 && a <= 10 },
  'sub10-inverse': { label: '与加法互逆', group: 'sub10', op: 'subtraction', range: 10, sub: (a, b, r) => a <= 10 && b >= 1 && r >= 1 },

  // —— 20 以内加法 ——
  'add20-ten-plus': { label: '10 加几', group: 'add20', op: 'addition', range: 20, add: (a, b, s) => (a === 10 || b === 10) && s > 10 && s <= 20 },
  'add20-teen-plus-unit': { label: '十几加个位', group: 'add20', op: 'addition', range: 20, add: (a, b, s) => a >= 11 && a <= 19 && b >= 1 && b <= 8 && ones(a) + b <= 9 && s <= 20 },
  'add20-no-carry': { label: '不进位加法', group: 'add20', op: 'addition', range: 20, add: (a, b, s) => a >= 1 && b >= 1 && s >= 11 && s <= 20 && ones(a) + ones(b) <= 9 },
  'add20-carry': { label: '进位加法', group: 'add20', op: 'addition', range: 20, add: (a, b, s) => a >= 2 && b >= 2 && s <= 20 && ones(a) + ones(b) >= 10 },
  'add20-make-ten': { label: '凑十法', group: 'add20', op: 'addition', range: 20, add: (a, b, s) => a >= 2 && a <= 9 && b >= 2 && b <= 9 && s >= 11 && s <= 18 },

  // —— 20 以内减法 ——
  'sub20-teen-minus-unit': { label: '十几减个位', group: 'sub20', op: 'subtraction', range: 20, sub: (a, b, r) => a >= 11 && a <= 19 && b >= 1 && b <= 9 && ones(a) >= b && r >= 0 },
  'sub20-no-borrow': { label: '不退位减法', group: 'sub20', op: 'subtraction', range: 20, sub: (a, b, r) => a >= 11 && a <= 20 && b >= 1 && ones(a) >= ones(b) && r >= 0 && b < a },
  'sub20-borrow': { label: '退位减法', group: 'sub20', op: 'subtraction', range: 20, sub: (a, b, r) => a >= 11 && a <= 20 && b >= 2 && b <= 9 && ones(a) < b && r >= 0 },
  'sub20-break-ten': { label: '破十法', group: 'sub20', op: 'subtraction', range: 20, sub: (a, b, r) => a >= 11 && a <= 18 && b >= 2 && b <= 9 && ones(a) < b && r >= 1 && r <= 9 },
  'sub20-inverse': { label: '与加法互逆', group: 'sub20', op: 'subtraction', range: 20, sub: (a, b, r) => a >= 11 && a <= 20 && b >= 1 && r >= 1 && b < a },
}

export const SKILL_GROUP_LABEL: Record<SkillGroup, string> = {
  add10: '10 以内加法',
  sub10: '10 以内减法',
  add20: '20 以内加法',
  sub20: '20 以内减法',
}

export const SKILLS_BY_GROUP: Record<SkillGroup, SkillTag[]> = {
  add10: [],
  sub10: [],
  add20: [],
  sub20: [],
}
;(Object.keys(SKILL_META) as SkillTag[]).forEach((tag) => {
  SKILLS_BY_GROUP[SKILL_META[tag].group].push(tag)
})

function enumerateAdd(pred: (a: number, b: number, s: number) => boolean): Equation[] {
  const out: Equation[] = []
  for (let a = 0; a <= 20; a++) {
    for (let b = 0; b <= 20; b++) {
      const s = a + b
      if (s > 20) continue
      if (pred(a, b, s)) out.push({ left: a, right: b, result: s })
    }
  }
  return out
}

function enumerateSub(pred: (a: number, b: number, r: number) => boolean): Equation[] {
  const out: Equation[] = []
  for (let a = 0; a <= 20; a++) {
    for (let b = 0; b <= a; b++) {
      const r = a - b
      if (pred(a, b, r)) out.push({ left: a, right: b, result: r })
    }
  }
  return out
}

// 缓存每个技能的候选等式
const CACHE = new Map<SkillTag, Equation[]>()

export function skillEquations(tag: SkillTag): Equation[] {
  let list = CACHE.get(tag)
  if (!list) {
    const m = SKILL_META[tag]
    list = m.op === 'addition' ? enumerateAdd(m.add!) : enumerateSub(m.sub!)
    CACHE.set(tag, list)
  }
  return list
}

export function genEquationForSkill(tag: SkillTag): Equation {
  const list = skillEquations(tag)
  if (list.length === 0) {
    // 理论不会发生；兜底返回一个合法等式
    return { left: 1, right: 1, result: 2 }
  }
  return list[Math.floor(Math.random() * list.length)]
}

export function skillOperation(tag: SkillTag): Operation {
  return SKILL_META[tag].op
}

export function skillRange(tag: SkillTag): 10 | 20 {
  return SKILL_META[tag].range
}
