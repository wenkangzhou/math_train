import type { Question } from '@/types/math'

export type SubtractionTenFrameStrategy =
  | 'take-ten-first'
  | 'break-ten'
  | 'take-ones'

export interface SubtractionRemovalStep {
  amount: number
  action: string
  equation: string
  removeIndexes: number[]
}

export interface SubtractionTenFramePlan {
  strategy: SubtractionTenFrameStrategy
  start: number
  remove: number
  remain: number
  firstGroupCount: number
  secondGroupCount: number
  intro: string
  done: string
  childSteps: string[]
  steps: SubtractionRemovalStep[]
}

function indexes(start: number, count: number): number[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => start + index)
}

export function supportsSubtractionTenFrame(question: Question): boolean {
  return (
    question.operation === 'subtraction' &&
    question.range === 20 &&
    (question.pattern === 'a-minus-b-equals-blank' ||
      question.pattern === 'a-minus-blank-equals-c') &&
    question.fullLeft > 10 &&
    question.fullLeft <= 20
  )
}

/**
 * 把 20 以内减法规划为孩子能在十格图上看见的动作：
 * - 减数大于等于 10：先拿走一整组 10，再拿走个位。
 * - 个位不够减：从完整的 10 里拿走，再和原来的个位合起来（破十）。
 * - 个位够减：只从个位组里拿走，完整的 10 保持不动。
 */
export function createSubtractionTenFramePlan(
  question: Question,
): SubtractionTenFramePlan {
  const start = question.fullLeft
  const remove = question.fullRight
  const remain = question.fullResult
  const firstGroupCount = Math.min(10, start)
  const secondGroupCount = Math.max(0, start - 10)
  const answerIsRemoved = question.pattern === 'a-minus-blank-equals-c'
  const done = answerIsRemoved
    ? `一共划掉 ${remove} 个，所以要填 ${remove}。`
    : `没有划掉的彩色图案有 ${remain} 个，所以答案是 ${remain}。`

  if (remove >= 10) {
    const extra = remove - 10
    const afterTen = start - 10
    const steps: SubtractionRemovalStep[] = [
      {
        amount: 10,
        action: '先拿走一整组 10 个',
        equation: `${start} − 10 = ${afterTen}`,
        removeIndexes: indexes(0, 10),
      },
    ]

    if (extra > 0) {
      steps.push({
        amount: extra,
        action: `再拿走 ${extra} 个`,
        equation: `${afterTen} − ${extra} = ${remain}`,
        removeIndexes: indexes(10, extra),
      })
    }

    return {
      strategy: 'take-ten-first',
      start,
      remove,
      remain,
      firstGroupCount,
      secondGroupCount,
      intro: `${start} 可以看成 10 和 ${secondGroupCount}。先整组拿走会更容易。`,
      done,
      childSteps: [
        `看成 10 和 ${secondGroupCount}`,
        '先拿走一整组 10',
        extra > 0 ? `再拿走 ${extra}` : '数一数剩下的',
      ],
      steps,
    }
  }

  if (secondGroupCount > 0 && secondGroupCount < remove) {
    const leftInTen = 10 - remove
    return {
      strategy: 'break-ten',
      start,
      remove,
      remain,
      firstGroupCount,
      secondGroupCount,
      intro: `${start} 可以看成 10 和 ${secondGroupCount}。个位不够减，就从 10 里面拿。`,
      done,
      childSteps: [
        `看成 10 和 ${secondGroupCount}`,
        `从 10 里拿走 ${remove}`,
        `把 ${leftInTen} 和 ${secondGroupCount} 合起来`,
      ],
      steps: [
        {
          amount: remove,
          action: `从完整的 10 里拿走 ${remove} 个`,
          equation: `10 − ${remove} = ${leftInTen}`,
          removeIndexes: indexes(0, remove),
        },
        {
          amount: 0,
          action: `把剩下的 ${leftInTen} 和 ${secondGroupCount} 合起来`,
          equation: `${leftInTen} + ${secondGroupCount} = ${remain}`,
          removeIndexes: [],
        },
      ],
    }
  }

  const groupStart = start > 10 ? 10 : 0
  const onesGroup = start > 10 ? secondGroupCount : start
  const onesRemain = onesGroup - remove
  const steps: SubtractionRemovalStep[] = [
    {
      amount: remove,
      action: `从右边这组拿走 ${remove} 个`,
      equation: `${onesGroup} − ${remove} = ${onesRemain}`,
      removeIndexes: indexes(groupStart, remove),
    },
  ]

  if (start > 10) {
    steps.push({
      amount: 0,
      action: `把完整的 10 和剩下的 ${onesRemain} 合起来`,
      equation: `10 + ${onesRemain} = ${remain}`,
      removeIndexes: [],
    })
  }

  return {
    strategy: 'take-ones',
    start,
    remove,
    remain,
    firstGroupCount,
    secondGroupCount,
    intro: `${start} 可以看成 10 和 ${secondGroupCount}。完整的 10 不用动。`,
    done,
    childSteps: [
      `看成 10 和 ${secondGroupCount}`,
      `从 ${onesGroup} 里拿走 ${remove}`,
      `把 10 和 ${onesRemain} 合起来`,
    ],
    steps,
  }
}

export function removedIndexesAfterStep(
  plan: SubtractionTenFramePlan,
  completedSteps: number,
): number[] {
  return plan.steps
    .slice(0, completedSteps)
    .flatMap((step) => step.removeIndexes)
}

export function remainingAfterStep(
  plan: SubtractionTenFramePlan,
  completedSteps: number,
): number {
  const removed = plan.steps
    .slice(0, completedSteps)
    .reduce((total, step) => total + step.amount, 0)
  return plan.start - removed
}
