import type { Question } from '@/types/math'

export type GuidedHintMethod = 'objects' | 'numberline'
export type ObjectHintMode = 'picture' | 'manipulative'

// 默认先给具体数量；20 以内或连续答错两次后，再引导到数轴策略。
export function recommendedHintMethod(
  question: Question,
  attempts: number,
): GuidedHintMethod {
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
): GuidedHintMethod {
  return current === 'objects' ? 'numberline' : 'objects'
}
