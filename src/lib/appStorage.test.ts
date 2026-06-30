import { describe, it, expect } from 'vitest'
import type { PracticeResult, Question, StoredHistory } from '@/types/math'
import {
  migrateStorageV1ToV2,
  mapV1History,
  mapV1Wrong,
} from './migrations'
import {
  applyLearningResult,
  normalizeAppStorage,
  createFreshStorage,
} from './appStorage'
import { DEFAULT_PROFILE_SETTINGS } from './defaults'
import { STORAGE_VERSION } from '@/types/storage'

describe('v1 → v2 数据迁移', () => {
  it('能迁移完整的 v1 设置与历史，不丢数据', () => {
    const v1settings = {
      selectedRanges: ['addition-within-20' as const],
      questionCount: 20 as const,
      autoShowVisualHint: true,
    }
    const v1history: StoredHistory = {
      totalStars: 42,
      entries: [
        { date: 1700000000000, total: 10, correct: 9, stars: 9, bestStreak: 5, accuracy: 0.9 },
        { date: 1700000100000, total: 5, correct: 5, stars: 5, bestStreak: 5, accuracy: 1 },
      ],
      lastWrongQuestions: [],
    }

    const s = migrateStorageV1ToV2(v1settings, v1history)
    expect(s.version).toBe(STORAGE_VERSION)
    expect(s.profiles).toHaveLength(1)
    const pid = s.profiles[0].id
    expect(s.activeProfileId).toBe(pid)

    // 设置合并：v1 字段覆盖、第二版字段补默认
    expect(s.settingsByProfile[pid].selectedRanges).toEqual(['addition-within-20'])
    expect(s.settingsByProfile[pid].questionCount).toBe(20)
    expect(s.settingsByProfile[pid].autoShowVisualHint).toBe(true)
    expect(s.settingsByProfile[pid].speechRate).toBe(DEFAULT_PROFILE_SETTINGS.speechRate)
    expect(s.settingsByProfile[pid].soundEnabled).toBe(true)
    expect(s.settingsByProfile[pid].autoReadQuestion).toBe(true)
    expect(s.settingsByProfile[pid].autoReadFeedback).toBe(true)

    // 历史
    expect(s.historyByProfile[pid]).toHaveLength(2)
    expect(s.historyByProfile[pid][0].totalQuestions).toBe(10)
    expect(s.historyByProfile[pid][0].correctQuestions).toBe(9)

    // 星星迁入奖励
    expect(s.rewardsByProfile[pid].stars).toBe(42)
  })

  it('v1 数据为空也能产出可用的默认存储', () => {
    const s = migrateStorageV1ToV2(null, null)
    expect(s.profiles).toHaveLength(1)
    expect(s.rewardsByProfile[s.profiles[0].id].stars).toBe(0)
    expect(s.historyByProfile[s.profiles[0].id]).toEqual([])
  })

  it('mapV1History 对缺失字段给默认值', () => {
    const hist = mapV1History('p1', { totalStars: 0, entries: [{ date: 0 } as never], lastWrongQuestions: [] }, DEFAULT_PROFILE_SETTINGS)
    expect(hist).toHaveLength(1)
    expect(hist[0].totalQuestions).toBe(0)
    expect(hist[0].accuracy).toBe(0)
    expect(hist[0].profileId).toBe('p1')
  })

  it('mapV1Wrong 过滤非法项并初始化为待练习', () => {
    const wrong = mapV1Wrong([{ id: 'a' } as never, null as never, undefined as never])
    expect(wrong).toHaveLength(1)
    expect(wrong[0].mastered).toBe(false)
    expect(wrong[0].correctCountAfterWrong).toBe(0)
    expect(wrong[0].reviewStage).toBe(0)
    expect(wrong[0].nextReviewAt).not.toBe('')
  })
})

describe('normalizeAppStorage 防御', () => {
  it('null / 非对象 → 全新存储', () => {
    expect(normalizeAppStorage(null).profiles).toHaveLength(1)
    expect(normalizeAppStorage(42).profiles).toHaveLength(1)
    expect(normalizeAppStorage('bad').version).toBe(STORAGE_VERSION)
  })

  it('档案缺失分区时补默认，不崩溃', () => {
    const broken = {
      version: 2,
      activeProfileId: 'nope',
      profiles: [{ id: 'p1', name: 'A', avatar: 'bear', currentLevel: 'x', preferredTheme: 'car', createdAt: '' }],
      // 故意缺 settingsByProfile / rewardsByProfile 等
    }
    const s = normalizeAppStorage(broken)
    expect(s.settingsByProfile['p1']).toBeDefined()
    expect(s.rewardsByProfile['p1']).toBeDefined()
    expect(s.historyByProfile['p1']).toEqual([])
    // activeProfileId 非法 → 回退到第一个档案
    expect(s.activeProfileId).toBe('p1')
  })

  it('profiles 为坏数据 → 回退到全新存储', () => {
    const s = normalizeAppStorage({ version: 2, profiles: 'oops' })
    expect(s.profiles).toHaveLength(1)
  })

  it('createFreshStorage 自带一个默认档案与初始车厢', () => {
    const s = createFreshStorage()
    expect(s.profiles).toHaveLength(1)
    const pid = s.profiles[0].id
    expect(s.rewardsByProfile[pid].unlockedCarriages.length).toBeGreaterThan(0)
  })

  it('旧版已下架车头会安全回退到默认机车', () => {
    const old = createFreshStorage()
    const pid = old.profiles[0].id
    old.rewardsByProfile[pid].selectedHead = 'head-red'

    const normalized = normalizeAppStorage(old)

    expect(normalized.rewardsByProfile[pid].selectedHead).toBe('head-classic')
  })
})

describe('练习结算、奖励与长期错题', () => {
  const question: Question = {
    id: 'q1',
    operation: 'addition',
    range: 10,
    pattern: 'a-plus-b-equals-blank',
    left: 3,
    right: 2,
    result: null,
    answer: 5,
    fullLeft: 3,
    fullRight: 2,
    fullResult: 5,
    visualTheme: 'car',
  }

  function result(params: {
    firstTry: boolean
    id?: string
    wrongAnswers?: number[]
  }): PracticeResult {
    const q = { ...question, id: params.id ?? question.id }
    return {
      questions: [q],
      records: [{
        questionId: q.id,
        answer: 5,
        isCorrect: params.firstTry,
        attempts: params.firstTry ? 1 : 2,
        usedHint: false,
        durationMs: 1000,
        wrongAnswers: params.wrongAnswers ?? [],
      }],
      durationMs: 1500,
      stars: params.firstTry ? 1 : 0,
      correctCount: params.firstTry ? 1 : 0,
      total: 1,
      accuracy: params.firstTry ? 1 : 0,
      bestStreak: params.firstTry ? 1 : 0,
      hintsUsed: 0,
      wrongQuestions: params.firstTry ? [] : [q],
    }
  }

  it('答错后按隔天、3天、7天复习，提前答对不会推进', () => {
    const storage = createFreshStorage()
    const pid = storage.profiles[0].id

    applyLearningResult(storage, {
      profileId: pid,
      settings: DEFAULT_PROFILE_SETTINGS,
      result: result({ firstTry: false, wrongAnswers: [4] }),
      now: new Date(2026, 0, 1, 12),
    })
    expect(storage.wrongQuestionsByProfile[pid]).toHaveLength(1)
    expect(storage.wrongQuestionsByProfile[pid][0].wrongAnswers).toEqual([4])
    expect(storage.wrongQuestionsByProfile[pid][0].nextReviewAt).toBe('2026-01-02')

    // 同一天重复答对不算间隔复习。
    applyLearningResult(storage, {
      profileId: pid,
      settings: DEFAULT_PROFILE_SETTINGS,
      result: result({ firstTry: true, id: 'q2' }),
      now: new Date(2026, 0, 1, 18),
    })
    expect(storage.wrongQuestionsByProfile[pid][0].mastered).toBe(false)
    expect(storage.wrongQuestionsByProfile[pid][0].reviewStage).toBe(0)

    applyLearningResult(storage, {
      profileId: pid,
      settings: DEFAULT_PROFILE_SETTINGS,
      result: result({ firstTry: true, id: 'q3' }),
      now: new Date(2026, 0, 2, 12),
    })
    expect(storage.wrongQuestionsByProfile[pid][0].reviewStage).toBe(1)
    expect(storage.wrongQuestionsByProfile[pid][0].nextReviewAt).toBe('2026-01-05')

    applyLearningResult(storage, {
      profileId: pid,
      settings: DEFAULT_PROFILE_SETTINGS,
      result: result({ firstTry: true, id: 'q4' }),
      now: new Date(2026, 0, 5, 12),
    })
    expect(storage.wrongQuestionsByProfile[pid][0].reviewStage).toBe(2)
    expect(storage.wrongQuestionsByProfile[pid][0].nextReviewAt).toBe('2026-01-12')

    applyLearningResult(storage, {
      profileId: pid,
      settings: DEFAULT_PROFILE_SETTINGS,
      result: result({ firstTry: true, id: 'q5' }),
      now: new Date(2026, 0, 12, 12),
    })
    expect(storage.wrongQuestionsByProfile[pid][0].reviewStage).toBe(3)
    expect(storage.wrongQuestionsByProfile[pid][0].mastered).toBe(true)
  })

  it('累计星星跨过阈值时返回新解锁车厢', () => {
    const storage = createFreshStorage()
    const pid = storage.profiles[0].id
    storage.rewardsByProfile[pid].stars = 49

    const rewards = applyLearningResult(storage, {
      profileId: pid,
      settings: DEFAULT_PROFILE_SETTINGS,
      result: result({ firstTry: true }),
    })

    expect(storage.rewardsByProfile[pid].stars).toBe(50)
    expect(rewards.newlyUnlocked.map((item) => item.id)).toContain('engine-red-express')
  })

  it('完成练习会获得路线邮票并累计到站次数', () => {
    const storage = createFreshStorage()
    const pid = storage.profiles[0].id

    const first = applyLearningResult(storage, {
      profileId: pid,
      settings: DEFAULT_PROFILE_SETTINGS,
      result: result({ firstTry: true }),
    })
    const second = applyLearningResult(storage, {
      profileId: pid,
      settings: DEFAULT_PROFILE_SETTINGS,
      result: result({ firstTry: true, id: 'q2' }),
    })

    expect(first.routeReward.destination).toBe('彩虹中央站')
    expect(first.routeReward.isNewStamp).toBe(true)
    expect(first.routeReward.tripCount).toBe(1)
    expect(second.routeReward.isNewStamp).toBe(false)
    expect(second.routeReward.tripCount).toBe(2)
    expect(storage.rewardsByProfile[pid].stickers).toContain(first.routeReward.stampId)
  })

  it('练习历史使用整轮连续答题时长', () => {
    const storage = createFreshStorage()
    const pid = storage.profiles[0].id
    const practiceResult = result({ firstTry: true })
    practiceResult.durationMs = 90_000

    applyLearningResult(storage, {
      profileId: pid,
      settings: DEFAULT_PROFILE_SETTINGS,
      result: practiceResult,
    })

    const item = storage.historyByProfile[pid][0]
    expect(Date.parse(item.completedAt) - Date.parse(item.startedAt)).toBe(90_000)
  })
})
