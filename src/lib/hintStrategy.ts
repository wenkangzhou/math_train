import type { Question } from '@/types/math'
import { supportsAdditionTenFrame } from '@/lib/additionTenFrame'
import { supportsSubtractionTenFrame } from '@/lib/subtractionTenFrame'

export type GuidedHintMethod = 'objects' | 'numberline' | 'tenframe'
export type ObjectHintMode = 'picture' | 'manipulative'

function supportsTenFrame(question: Question): boolean {
  return (
    supportsAdditionTenFrame(question) ||
    supportsSubtractionTenFrame(question)
  )
}

// 20以内加减法优先建立“十个一组”的数感；其他20以内题或连续答错后再用数轴。
export function recommendedHintMethod(
  question: Question,
  attempts: number,
): GuidedHintMethod {
  if (supportsTenFrame(question)) return 'tenframe'
  return question.range > 10 || attempts >= 2 ? 'numberline' : 'objects'
}

// 普通加法直接数图；缺项题和减法用“摆一摆”，让动作对应加进来/拿走。
export function objectHintMode(question: Question): ObjectHintMode {
  return question.pattern === 'a-plus-b-equals-blank'
    ? 'picture'
    : 'manipulative'
}

export function alternateHintMethod(
  current: GuidedHintMethod,
  question?: Question,
): GuidedHintMethod {
  if (question && supportsTenFrame(question)) {
    return current === 'tenframe' ? 'numberline' : 'tenframe'
  }
  return current === 'objects' ? 'numberline' : 'objects'
}
