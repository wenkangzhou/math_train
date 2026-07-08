import type { Question } from '@/types/math'

export type NumberLineDirection = 'left' | 'right'
export type NumberLineAnswerKind = 'landing' | 'steps'

export interface NumberLinePlan {
  start: number
  end: number
  steps: number
  direction: NumberLineDirection
  answerKind: NumberLineAnswerKind
  intro: string
  done: string
  stepLabels: string[]
}

export function createNumberLinePlan(question: Question): NumberLinePlan {
  const L = question.fullLeft
  const R = question.fullRight
  const C = question.fullResult

  switch (question.pattern) {
    case 'a-plus-b-equals-blank':
      return {
        start: L,
        end: C,
        steps: R,
        direction: 'right',
        answerKind: 'landing',
        intro: `先站在 ${L}，向右走 ${R} 步。`,
        done: `${L} 向右走 ${R} 步，停在 ${C}，答案是 ${C}。`,
        stepLabels: ['站在左边数', '向右走几步', '看停在哪里'],
      }
    case 'a-plus-blank-equals-c':
      return {
        start: L,
        end: C,
        steps: R,
        direction: 'right',
        answerKind: 'steps',
        intro: `从 ${L} 走到 ${C}，数一数走了几步。`,
        done: `从 ${L} 到 ${C} 走了 ${R} 步，答案是 ${R}。`,
        stepLabels: ['站在已有数', '走到总数', '数走了几步'],
      }
    case 'blank-plus-b-equals-c':
      return {
        start: C,
        end: L,
        steps: R,
        direction: 'left',
        answerKind: 'landing',
        intro: `先站在总数 ${C}，往左退 ${R} 步。`,
        done: `从 ${C} 往左退 ${R} 步，停在 ${L}，答案是 ${L}。`,
        stepLabels: ['站在总数', '退掉后来数', '看原来几个'],
      }
    case 'a-minus-b-equals-blank':
      return {
        start: L,
        end: C,
        steps: R,
        direction: 'left',
        answerKind: 'landing',
        intro: `先站在 ${L}，向左走 ${R} 步。`,
        done: `${L} 向左走 ${R} 步，停在 ${C}，答案是 ${C}。`,
        stepLabels: ['站在原来数', '向左拿走', '看剩下几个'],
      }
    case 'a-minus-blank-equals-c':
      return {
        start: L,
        end: C,
        steps: R,
        direction: 'left',
        answerKind: 'steps',
        intro: `从 ${L} 走到 ${C}，数一数拿走了几步。`,
        done: `从 ${L} 到 ${C} 走了 ${R} 步，答案是 ${R}。`,
        stepLabels: ['站在原来数', '走到剩下数', '数拿走几步'],
      }
    case 'blank-minus-b-equals-c':
      return {
        start: C,
        end: L,
        steps: R,
        direction: 'right',
        answerKind: 'landing',
        intro: `先站在剩下的 ${C}，把开走的 ${R} 个加回来。`,
        done: `从 ${C} 向右走 ${R} 步，停在 ${L}，答案是 ${L}。`,
        stepLabels: ['站在剩下数', '加回开走数', '看原来几个'],
      }
    default:
      return {
        start: L,
        end: C,
        steps: Math.abs(C - L),
        direction: C >= L ? 'right' : 'left',
        answerKind: 'landing',
        intro: '一步一步走，看看停在哪里。',
        done: `停在 ${question.answer}，答案是 ${question.answer}。`,
        stepLabels: ['找起点', '一步步走', '看答案'],
      }
  }
}

export function numberLineCurrentValue(
  plan: NumberLinePlan,
  step: number,
): number {
  return plan.direction === 'right'
    ? plan.start + step
    : plan.start - step
}
