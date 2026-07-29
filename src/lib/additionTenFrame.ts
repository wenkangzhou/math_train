import type { Question } from '@/types/math'

export type AdditionTenFrameStrategy =
  | 'make-ten'
  | 'teen-plus'
  | 'ten-plus'

export interface AdditionPlacementStep {
  amount: number
  action: string
  equation: string
  placedIndexes: number[]
}

export interface AdditionTenFramePlan {
  strategy: AdditionTenFrameStrategy
  base: number
  add: number
  total: number
  answerKind: 'total' | 'added'
  swapped: boolean
  intro: string
  done: string
  childSteps: string[]
  steps: AdditionPlacementStep[]
}

function indexes(start: number, count: number): number[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => start + index)
}

function normalizedParts(question: Question): {
  base: number
  add: number
  answerKind: 'total' | 'added'
  swapped: boolean
} {
  if (question.pattern === 'a-plus-blank-equals-c') {
    return {
      base: question.fullLeft,
      add: question.fullRight,
      answerKind: 'added',
      swapped: false,
    }
  }

  if (question.pattern === 'blank-plus-b-equals-c') {
    return {
      base: question.fullRight,
      add: question.fullLeft,
      answerKind: 'added',
      swapped: true,
    }
  }

  const base = Math.max(question.fullLeft, question.fullRight)
  const add = Math.min(question.fullLeft, question.fullRight)
  return {
    base,
    add,
    answerKind: 'total',
    swapped: base !== question.fullLeft,
  }
}

export function supportsAdditionTenFrame(question: Question): boolean {
  if (
    question.operation !== 'addition' ||
    question.range !== 20 ||
    question.fullResult <= 10 ||
    question.fullResult > 20
  ) {
    return false
  }

  const { base, add } = normalizedParts(question)
  return base > 0 && base <= 20 && add > 0 && base + add <= 20
}

/**
 * 把 20 以内加法规划为“先凑成 10，再处理剩余”的可视动作：
 * - 两个个位数跨 10：把较小加数拆成“补到 10”和“剩余”两段。
 * - 十几加个位：完整的 10 不动，只把个位合起来。
 * - 10 加几：保留完整十格，直接把新增数量放进第二格。
 */
export function createAdditionTenFramePlan(
  question: Question,
): AdditionTenFramePlan {
  const { base, add, answerKind, swapped } = normalizedParts(question)
  const total = question.fullResult
  const done = answerKind === 'added'
    ? `一共加入 ${add} 个，所以空格要填 ${add}。`
    : `两个十格里一共有 ${total} 个，所以答案是 ${total}。`

  if (base < 10) {
    const toTen = 10 - base
    const afterTen = add - toTen
    return {
      strategy: 'make-ten',
      base,
      add,
      total,
      answerKind,
      swapped,
      intro: swapped && answerKind === 'total'
        ? `把较大的 ${base} 放前面，先看看离 10 还差几个。`
        : `先放好 ${base} 个，看看离 10 还差几个。`,
      done,
      childSteps: [
        `先放 ${base}`,
        `拿 ${toTen} 个凑成 10`,
        `再放剩下的 ${afterTen}`,
      ],
      steps: [
        {
          amount: toTen,
          action: `先拿 ${toTen} 个，凑满第一个十格`,
          equation: `${base} + ${toTen} = 10`,
          placedIndexes: indexes(base, toTen),
        },
        {
          amount: afterTen,
          action: `再把剩下的 ${afterTen} 个放进去`,
          equation: `10 + ${afterTen} = ${total}`,
          placedIndexes: indexes(10, afterTen),
        },
      ],
    }
  }

  if (base === 10) {
    return {
      strategy: 'ten-plus',
      base,
      add,
      total,
      answerKind,
      swapped,
      intro: `左边已经是完整的 10，再加入 ${add} 个。`,
      done,
      childSteps: ['先看完整的 10', `再放 ${add} 个`, `数到 ${total}`],
      steps: [
        {
          amount: add,
          action: `把 ${add} 个放进第二个十格`,
          equation: `10 + ${add} = ${total}`,
          placedIndexes: indexes(10, add),
        },
      ],
    }
  }

  const baseOnes = base - 10
  const combinedOnes = baseOnes + add
  return {
    strategy: 'teen-plus',
    base,
    add,
    total,
    answerKind,
    swapped,
    intro: `${base} 可以看成 10 和 ${baseOnes}。完整的 10 不用动。`,
    done,
    childSteps: [
      `看成 10 和 ${baseOnes}`,
      `${baseOnes} 再加 ${add}`,
      `和完整的 10 合起来`,
    ],
    steps: [
      {
        amount: add,
        action: `把 ${add} 个放进个位格`,
        equation: `${baseOnes} + ${add} = ${combinedOnes}`,
        placedIndexes: indexes(base, add),
      },
      {
        amount: 0,
        action: `把 10 和 ${combinedOnes} 合起来`,
        equation: `10 + ${combinedOnes} = ${total}`,
        placedIndexes: [],
      },
    ],
  }
}

export function placedIndexesAfterStep(
  plan: AdditionTenFramePlan,
  completedSteps: number,
): number[] {
  return plan.steps
    .slice(0, completedSteps)
    .flatMap((step) => step.placedIndexes)
}

export function remainingAddendsAfterStep(
  plan: AdditionTenFramePlan,
  completedSteps: number,
): number {
  const placed = plan.steps
    .slice(0, completedSteps)
    .reduce((total, step) => total + step.amount, 0)
  return plan.add - placed
}
