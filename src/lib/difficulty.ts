import type { QuestionPattern } from '@/types/math'

// 题型难度等级（PRD 第十四节）：用于排序或未来的自适应
export const PATTERN_DIFFICULTY: Record<QuestionPattern, number> = {
  'a-plus-b-equals-blank': 1,
  'a-minus-b-equals-blank': 1,
  'a-plus-blank-equals-c': 2,
  'blank-plus-b-equals-c': 2,
  'a-minus-blank-equals-c': 3,
  'blank-minus-b-equals-c': 4,
}

// 结果等级（PRD 11.2）—— 始终使用正向评价
export interface ResultLevel {
  title: string
  emoji: string
  color: string
}

export function resultLevel(accuracy: number): ResultLevel {
  if (accuracy >= 0.9) {
    return { title: '数学小明星', emoji: '🌟', color: '#ffb300' }
  }
  if (accuracy >= 0.7) {
    return { title: '认真小达人', emoji: '🎉', color: '#4fb0f0' }
  }
  return { title: '勇敢练习家', emoji: '💪', color: '#8ed081' }
}
