import type {
  Operation,
  Question,
  QuestionFormat,
  QuestionPattern,
  RangeType,
  SkillTag,
  VisualTheme,
  PracticeSettings,
} from '@/types/math'
import { VISUAL_THEMES } from './visualTheme'
import { genEquationForSkill, skillOperation, skillRange } from './skills'
import { storyText } from './story'

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

function randInt(min: number, max: number): number {
  // [min, max] 闭区间
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickTheme(): VisualTheme {
  return pick(VISUAL_THEMES).theme
}

let idCounter = 0
function nextId(): string {
  idCounter += 1
  return `q_${Date.now().toString(36)}_${idCounter}`
}

// ---------------------------------------------------------------------------
// 题型与运算映射
// ---------------------------------------------------------------------------

export const ADDITION_PATTERNS: QuestionPattern[] = [
  'a-plus-b-equals-blank',
  'a-plus-blank-equals-c',
  'blank-plus-b-equals-c',
]

export const SUBTRACTION_PATTERNS: QuestionPattern[] = [
  'a-minus-b-equals-blank',
  'a-minus-blank-equals-c',
  'blank-minus-b-equals-c',
]

export function patternOperation(pattern: QuestionPattern): Operation {
  return ADDITION_PATTERNS.includes(pattern) ? 'addition' : 'subtraction'
}

export function rangeOperation(range: RangeType): Operation {
  return range.startsWith('addition') ? 'addition' : 'subtraction'
}

export function rangeMax(range: RangeType): 10 | 20 {
  return range.endsWith('20') ? 20 : 10
}

// 题型的相对出现权重（PRD 第十四节）。
// 标准结果题 > 中间缺项题 > 前项缺失题；? - b = c 难度最高，权重最低。
const PATTERN_WEIGHT: Record<QuestionPattern, number> = {
  'a-plus-b-equals-blank': 50,
  'a-minus-b-equals-blank': 50,
  'a-plus-blank-equals-c': 18,
  'a-minus-blank-equals-c': 18,
  'blank-plus-b-equals-c': 15,
  'blank-minus-b-equals-c': 7,
}

function weightedPickPattern(patterns: QuestionPattern[]): QuestionPattern {
  const total = patterns.reduce((s, p) => s + PATTERN_WEIGHT[p], 0)
  let r = Math.random() * total
  for (const p of patterns) {
    r -= PATTERN_WEIGHT[p]
    if (r <= 0) return p
  }
  return patterns[patterns.length - 1]
}

// ---------------------------------------------------------------------------
// 等式数字生成
// ---------------------------------------------------------------------------

interface Equation {
  left: number
  right: number
  result: number
}

// 是否为「过于简单」的题：0 + n / n + 0 / n - 0 / n - n
function isTooTrivial(op: Operation, left: number, right: number): boolean {
  if (op === 'addition') {
    return left === 0 || right === 0
  }
  // subtraction
  return right === 0 || left === right
}

/**
 * 生成一个合法的完整等式。
 * - 加法：left + right = result，result <= max
 * - 减法：left - right = result，result >= 0
 * 大部分题中 left、right >= 1，并尽量避开过于简单的题。
 */
function generateEquation(op: Operation, max: 10 | 20): Equation {
  for (let attempt = 0; attempt < 40; attempt++) {
    let left: number
    let right: number
    let result: number

    if (op === 'addition') {
      // 偏向 >= 1 的加数，结果不超过 max
      left = randInt(1, max - 1)
      const maxRight = max - left
      right = randInt(maxRight >= 1 ? 1 : 0, maxRight)
      result = left + right
    } else {
      // 减法：被减数 left <= max，减数 right <= left
      left = randInt(2, max)
      right = randInt(1, left - 1 >= 1 ? left - 1 : left)
      result = left - right
    }

    // 大概率拒绝过于简单的题（保留约 10% 以维持多样性）
    if (isTooTrivial(op, left, right) && Math.random() < 0.9) continue

    return { left, right, result }
  }

  // 兜底：保证一定返回一个合法等式
  if (op === 'addition') {
    const left = randInt(1, max - 1)
    const right = randInt(1, max - left)
    return { left, right, result: left + right }
  }
  const left = randInt(2, max)
  const right = randInt(1, left)
  return { left, right, result: left - right }
}

// 根据题型把对应数字「挖空」，answer 为被挖空的值
function applyPattern(
  eq: Equation,
  pattern: QuestionPattern,
): Pick<Question, 'left' | 'right' | 'result' | 'answer'> {
  switch (pattern) {
    case 'a-plus-b-equals-blank':
    case 'a-minus-b-equals-blank':
      return { left: eq.left, right: eq.right, result: null, answer: eq.result }
    case 'a-plus-blank-equals-c':
    case 'a-minus-blank-equals-c':
      return { left: eq.left, right: null, result: eq.result, answer: eq.right }
    case 'blank-plus-b-equals-c':
    case 'blank-minus-b-equals-c':
      return { left: null, right: eq.right, result: eq.result, answer: eq.left }
  }
}

function signatureOf(q: Question): string {
  return `${q.fullLeft}${q.operation === 'addition' ? '+' : '-'}${q.fullRight}|${q.pattern}`
}

// ---------------------------------------------------------------------------
// 单题生成
// ---------------------------------------------------------------------------

export interface GenerateOneOptions {
  ranges: RangeType[]
  patterns: QuestionPattern[]
  // 难度系数 0~1，越大越倾向较大数字（用于练习过程中轻微递增）
  difficulty?: number
  // 第二版：高级细分技能（提供则按技能约束生成，覆盖 ranges 的粗粒度）
  skillTags?: SkillTag[]
}

export function generateQuestion(opts: GenerateOneOptions): Question {
  const { ranges, patterns, skillTags } = opts

  let op: Operation
  let max: 10 | 20
  let eq: ReturnType<typeof generateEquation>
  let skill: SkillTag | undefined

  if (skillTags && skillTags.length > 0) {
    // 技能模式：先选一个技能，决定运算/范围/约束等式
    skill = pick(skillTags)
    op = skillOperation(skill)
    max = skillRange(skill)
    eq = genEquationForSkill(skill)
  } else {
    // 粗粒度模式（v1 行为）
    const range = pick(ranges)
    op = rangeOperation(range)
    max = rangeMax(range)
    eq = generateEquation(op, max)
  }

  // 在与该运算匹配、且用户已选的题型中按权重挑选
  const matchingPatterns = patterns.filter((p) => patternOperation(p) === op)
  const pattern = weightedPickPattern(
    matchingPatterns.length > 0 ? matchingPatterns : defaultPatternsForOp(op),
  )

  const blanked = applyPattern(eq, pattern)

  return {
    id: nextId(),
    operation: op,
    range: max,
    pattern,
    left: blanked.left,
    right: blanked.right,
    result: blanked.result,
    answer: blanked.answer,
    fullLeft: eq.left,
    fullRight: eq.right,
    fullResult: eq.result,
    visualTheme: pickTheme(),
    skill,
  }
}

function defaultPatternsForOp(op: Operation): QuestionPattern[] {
  return op === 'addition'
    ? ['a-plus-b-equals-blank']
    : ['a-minus-b-equals-blank']
}

// ---------------------------------------------------------------------------
// 整套练习生成
// ---------------------------------------------------------------------------

/**
 * 根据设置生成一整套练习题。
 * - 难度随进度轻微递增；第一题更简单
 * - 避免连续两题完全相同的数字组合 + 题型
 * - 第二版：支持细分技能（skillTags）与呈现格式（questionFormats：算式/图片/故事）
 */
export function generateQuestions(
  settings: PracticeSettings & {
    skillTags?: SkillTag[]
    questionFormats?: QuestionFormat[]
  },
): Question[] {
  const { selectedRanges, selectedPatterns, questionCount } = settings
  const skillTags = settings.skillTags ?? []
  const formats: QuestionFormat[] =
    settings.questionFormats && settings.questionFormats.length > 0
      ? settings.questionFormats
      : ['equation']

  // 兜底：保证至少有可用的范围与题型
  const ranges =
    selectedRanges.length > 0 ? selectedRanges : ['addition-within-10' as RangeType]

  const result: Question[] = []
  const seen = new Set<string>()
  let lastSig = ''

  for (let i = 0; i < questionCount; i++) {
    const difficulty = questionCount > 1 ? i / (questionCount - 1) : 0
    let q = generateQuestion({ ranges, patterns: selectedPatterns, difficulty, skillTags })

    // 尝试避免与上一题相同、以及整套重复
    let guard = 0
    while (
      guard < 30 &&
      (signatureOf(q) === lastSig || seen.has(signatureOf(q)))
    ) {
      q = generateQuestion({ ranges, patterns: selectedPatterns, difficulty, skillTags })
      guard++
    }

    lastSig = signatureOf(q)
    seen.add(lastSig)
    result.push(applyFormat(q, pick(formats)))
  }

  return result
}

// 给题目附加呈现格式与故事文案
function applyFormat(q: Question, format: QuestionFormat): Question {
  if (format === 'story') {
    return { ...q, format, story: storyText(q) }
  }
  if (format === 'picture') {
    return { ...q, format }
  }
  return { ...q, format: 'equation' }
}
