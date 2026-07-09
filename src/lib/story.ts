// 数数小火车 / Math Train — 故事题文案（PRD 功能十四）
// 1~2 句话，低幼、不出现成人化场景；支持语音朗读。

import type { Question } from '@/types/math'
import { pictureBookQuestionText } from './pictureBook'

// 把题目转成故事文本（缺项题引导寻找未知数）。
export function storyText(q: Question): string {
  return pictureBookQuestionText(q)
}
