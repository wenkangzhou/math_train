import { describe, expect, it } from 'vitest'
import type { WrongQuestionRecord } from '@/types/storage'
import { applySpacedReviewResult, normalizeWrongReviewRecord } from './spacedReview'

function oldRecord(): WrongQuestionRecord {
  return {
    id: 'wrong-1',
    question: {} as WrongQuestionRecord['question'],
    wrongAnswers: [4],
    attempts: 2,
    usedHint: false,
    createdAt: '2026-01-01T04:00:00.000Z',
    lastPracticedAt: '2026-01-01T04:00:00.000Z',
    correctCountAfterWrong: 0,
    reviewStage: 0,
    nextReviewAt: '2026-01-02',
    lastReviewDate: '2026-01-01',
    mastered: false,
  }
}

describe('错题间隔复习状态机', () => {
  it('复习答错会重置到隔天阶段', () => {
    const record = oldRecord()
    record.reviewStage = 2
    record.correctCountAfterWrong = 2
    record.nextReviewAt = '2026-01-12'

    applySpacedReviewResult(record, false, new Date(2026, 0, 12, 12))

    expect(record.reviewStage).toBe(0)
    expect(record.mastered).toBe(false)
    expect(record.nextReviewAt).toBe('2026-01-13')
  })

  it('旧版累计答对进度会转换为对应间隔阶段', () => {
    type LegacyRecord = Omit<
      WrongQuestionRecord,
      'reviewStage' | 'nextReviewAt' | 'lastReviewDate'
    > & Partial<Pick<WrongQuestionRecord, 'reviewStage' | 'nextReviewAt' | 'lastReviewDate'>>
    const legacy: LegacyRecord = oldRecord()
    delete legacy.reviewStage
    delete legacy.nextReviewAt
    delete legacy.lastReviewDate
    legacy.correctCountAfterWrong = 1

    const normalized = normalizeWrongReviewRecord(legacy as WrongQuestionRecord)

    expect(normalized.reviewStage).toBe(1)
    expect(normalized.nextReviewAt).toBe('2026-01-04')
  })
})
