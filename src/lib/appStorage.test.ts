import { describe, it, expect } from 'vitest'
import type { StoredHistory } from '@/types/math'
import {
  migrateStorageV1ToV2,
  mapV1History,
  mapV1Wrong,
} from './migrations'
import { normalizeAppStorage, createFreshStorage } from './appStorage'
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
    expect(s.settingsByProfile[pid].soundEnabled).toBe(false)

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
})
