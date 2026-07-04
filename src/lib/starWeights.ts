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
 * 从答对记录中按权重累加星星总数
 */
export function sumWeightedStars(
  records: { isCorrect: boolean; questionStarWeight?: number }[],
): number {
  return records.reduce((sum, r) => {
    if (r.isCorrect && r.questionStarWeight != null) {
      return sum + r.questionStarWeight
    }
    return sum
  }, 0)
}
