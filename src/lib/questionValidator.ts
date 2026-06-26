import type { Question } from '@/types/math'

// 判断答案是否正确
export function checkAnswer(question: Question, value: number): boolean {
  return value === question.answer
}

// 校验一道题本身是否合法（用于生成器测试与边界检查）
export function isValidQuestion(q: Question): boolean {
  const { fullLeft, fullRight, fullResult, operation, range } = q

  if ([fullLeft, fullRight, fullResult].some((n) => !Number.isInteger(n) || n < 0)) {
    return false
  }

  // 等式必须成立
  if (operation === 'addition') {
    if (fullLeft + fullRight !== fullResult) return false
  } else {
    if (fullLeft - fullRight !== fullResult) return false
  }

  // 不超过所选范围、不产生负数
  if (fullLeft > range || fullRight > range || fullResult > range) return false
  if (fullResult < 0) return false

  // answer 必须等于被挖空的那个数
  const blanks = [
    q.left === null ? fullLeft : null,
    q.right === null ? fullRight : null,
    q.result === null ? fullResult : null,
  ].filter((n): n is number => n !== null)

  if (blanks.length !== 1) return false
  return blanks[0] === q.answer
}

// 把题目格式化为可读字符串（? 表示待填位置），用于展示与调试
export function questionText(q: Question): string {
  const sign = q.operation === 'addition' ? '+' : '-'
  const l = q.left === null ? '?' : q.left
  const r = q.right === null ? '?' : q.right
  const res = q.result === null ? '?' : q.result
  return `${l} ${sign} ${r} = ${res}`
}
