import type { Question } from '@/types/math'

/**
 * 每道题的权重（星数）
 * - 10以内加法：1星，减法：2星
 * - 20以内加法：2星，减法：3星
 * - 非标准算式（?=）额外加星
 *   - a + ? = c / a - ? = c / ? + b = c：+1
 *   - ? - b = c：+2（最难）
 */
export function getQuestionWeight(q: Question): number {
  // 基础分：range × operation
  const base: number =
    q.range === 10
      ? q.operation === 'addition'
        ? 1
        : 2
      : q.range === 20
        ? q.operation === 'addition'
          ? 2
          : 3
        : 1

  // 变式加成
  const patternBonus: Record<Question['pattern'], number> = {
    'a-plus-b-equals-blank': 0,
    'a-minus-b-equals-blank': 0,
    'a-plus-blank-equals-c': 1,
    'a-minus-blank-equals-c': 1,
    'blank-plus-b-equals-c': 1,
    'blank-minus-b-equals-c': 2,
  }

  return base + patternBonus[q.pattern]
}

/**
 * 本题实际获得的星星：首次答对拿完整难度星，重试后做对也保留 1 颗坚持星。
 */
export function getEarnedStars(q: Question, firstTry: boolean): number {
  return firstTry ? getQuestionWeight(q) : 1
}

export function estimateTripsRemaining(
  starsRemaining: number,
  averageStarsPerTrip: number,
): number {
  if (starsRemaining <= 0) return 0
  return Math.ceil(starsRemaining / Math.max(1, averageStarsPerTrip))
}

/**
 * 从答题记录中累加每题实际获得的星星
 */
export function sumWeightedStars(
  records: { questionStarWeight?: number }[],
): number {
  return records.reduce(
    (sum, record) => sum + Math.max(0, record.questionStarWeight ?? 0),
    0,
  )
}
