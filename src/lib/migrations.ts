// 数数小火车 / Math Train — 本地存储 v1 → v2 迁移
// 纯函数实现，便于单测；不直接触碰 localStorage。

import type { PracticeSettings, Question, StoredHistory } from '@/types/math'
import type {
  AppStorage,
  PracticeHistoryItem,
  WrongQuestionRecord,
} from '@/types/storage'
import { STORAGE_VERSION } from '@/types/storage'
import {
  DEFAULT_PROFILE_SETTINGS,
  DEFAULT_LEVEL,
  createDefaultRewardState,
  createProfile,
} from './defaults'
import { genId } from './id'
import { createWrongReviewSchedule } from './spacedReview'

// v1 的两个 localStorage key
export const V1_SETTINGS_KEY = 'math-practice-settings'
export const V1_HISTORY_KEY = 'math-practice-history'

// 把 v1 历史条目转成 v2 历史项（缺失字段给默认值）
export function mapV1History(
  profileId: string,
  h: StoredHistory | null,
  settings: PracticeSettings,
): PracticeHistoryItem[] {
  if (!h || !Array.isArray(h.entries)) return []
  return h.entries.map((e) => {
    const ms = typeof e?.date === 'number' ? e.date : Date.now()
    const iso = new Date(ms).toISOString()
    const total = Number(e?.total) || 0
    const correct = Number(e?.correct) || 0
    return {
      id: genId('hist'),
      profileId,
      startedAt: iso,
      completedAt: iso,
      settings,
      totalQuestions: total,
      correctQuestions: correct,
      accuracy:
        typeof e?.accuracy === 'number'
          ? e.accuracy
          : total > 0
            ? correct / total
            : 0,
      totalAttempts: total,
      hintCount: 0,
      averageDurationMs: 0,
      bestStreak: Number(e?.bestStreak) || 0,
      earnedStars: Number(e?.stars) || 0,
      difficultyStart: DEFAULT_LEVEL,
      difficultyEnd: DEFAULT_LEVEL,
    }
  })
}

// 把 v1 最近错题转成 v2 错题记录（初始状态：待练习）
export function mapV1Wrong(qs: Question[] | undefined): WrongQuestionRecord[] {
  if (!Array.isArray(qs)) return []
  const nowDate = new Date()
  const now = nowDate.toISOString()
  return qs
    .filter((q) => q && typeof q === 'object')
    .map((q) => ({
      id: genId('wrong'),
      question: q,
      wrongAnswers: [],
      attempts: 1,
      usedHint: false,
      createdAt: now,
      lastPracticedAt: now,
      ...createWrongReviewSchedule(nowDate),
    }))
}

// v1 → v2 迁移：把旧的设置/历史/错题/星星归入一个默认档案。
export function migrateStorageV1ToV2(
  v1settings: Partial<PracticeSettings> | null,
  v1history: StoredHistory | null,
): AppStorage {
  const profile = createProfile({ name: '小朋友', avatar: 'train' })
  const settings = {
    ...DEFAULT_PROFILE_SETTINGS,
    ...(v1settings ?? {}),
  }
  const stars = Number(v1history?.totalStars) || 0

  return {
    version: STORAGE_VERSION,
    activeProfileId: profile.id,
    profiles: [profile],
    settingsByProfile: { [profile.id]: settings },
    historyByProfile: {
      [profile.id]: mapV1History(profile.id, v1history, settings),
    },
    wrongQuestionsByProfile: {
      [profile.id]: mapV1Wrong(v1history?.lastWrongQuestions),
    },
    rewardsByProfile: { [profile.id]: createDefaultRewardState(stars) },
    dailyProgressByProfile: {},
  }
}
