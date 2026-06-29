// 数数小火车 / Math Train — 第二版统一本地存储读写层（AppStorage v2）
//
// 设计要点：
//  - 单一 key 持久化整个 AppStorage；首次启动若检测到 v1 数据则自动迁移，不丢失。
//  - 所有读取都经过 normalize 防御：缺字段补默认、坏数据不崩（PRD 23.4）。
//  - v1 的 storage.ts 暂保留，运行中的旧入口仍可用；第二版组件改用本模块。

import type { ChildProfile, ProfileSettings } from '@/types/profile'
import type {
  PracticeResult,
  PracticeSettings,
  Question,
} from '@/types/math'
import type { RewardState } from '@/types/rewards'
import type { Carriage } from '@/types/rewards'
import type {
  AppStorage,
  DailyProgress,
  PracticeHistoryItem,
  WrongQuestionRecord,
} from '@/types/storage'
import { STORAGE_KEY, STORAGE_VERSION } from '@/types/storage'
import {
  DEFAULT_PROFILE_SETTINGS,
  createDefaultRewardState,
  createProfile,
} from './defaults'
import {
  migrateStorageV1ToV2,
  V1_HISTORY_KEY,
  V1_SETTINGS_KEY,
} from './migrations'
import { carriagesUnlockedByStars, getCarriage } from './carriages'
import { dayDiff, todayStr } from './date'
import { genId } from './id'

function hasLS(): boolean {
  return typeof localStorage !== 'undefined'
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

// 全新安装：建立一个默认档案
export function createFreshStorage(): AppStorage {
  const profile = createProfile({ name: '小朋友', avatar: 'train' })
  return {
    version: STORAGE_VERSION,
    activeProfileId: profile.id,
    profiles: [profile],
    settingsByProfile: { [profile.id]: { ...DEFAULT_PROFILE_SETTINGS } },
    historyByProfile: { [profile.id]: [] },
    wrongQuestionsByProfile: { [profile.id]: [] },
    rewardsByProfile: { [profile.id]: createDefaultRewardState(0) },
    dailyProgressByProfile: {},
  }
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

function asRecord<T>(v: unknown): Record<string, T> {
  return v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, T>)
    : {}
}

// 防御性归一化：保证返回结构完整、引用安全。
export function normalizeAppStorage(raw: unknown): AppStorage {
  const base = createFreshStorage()
  if (!raw || typeof raw !== 'object') return base

  const r = raw as Partial<AppStorage>
  const profiles = asArray<ChildProfile>(r.profiles).filter(
    (p) => p && typeof p.id === 'string',
  )

  // 没有任何合法档案 → 回退到全新存储
  if (profiles.length === 0) return base

  const settingsByProfile = asRecord<ProfileSettings>(r.settingsByProfile)
  const historyByProfile = asRecord<PracticeHistoryItem[]>(r.historyByProfile)
  const wrongByProfile = asRecord<WrongQuestionRecord[]>(
    r.wrongQuestionsByProfile,
  )
  const rewardsByProfile = asRecord<RewardState>(r.rewardsByProfile)
  const dailyByProfile = asRecord<DailyProgress>(r.dailyProgressByProfile)

  // 逐档案补齐各分区
  const out: AppStorage = {
    version: STORAGE_VERSION,
    activeProfileId: null,
    profiles,
    settingsByProfile: {},
    historyByProfile: {},
    wrongQuestionsByProfile: {},
    rewardsByProfile: {},
    dailyProgressByProfile: {},
  }

  for (const p of profiles) {
    out.settingsByProfile[p.id] = {
      ...DEFAULT_PROFILE_SETTINGS,
      ...(settingsByProfile[p.id] ?? {}),
    }
    out.historyByProfile[p.id] = asArray<PracticeHistoryItem>(
      historyByProfile[p.id],
    )
    out.wrongQuestionsByProfile[p.id] = asArray<WrongQuestionRecord>(
      wrongByProfile[p.id],
    )
    const defaultReward = createDefaultRewardState(0)
    const savedReward = rewardsByProfile[p.id] ?? defaultReward
    out.rewardsByProfile[p.id] = {
      ...defaultReward,
      ...savedReward,
      stars: Number.isFinite(savedReward.stars)
        ? Math.max(0, savedReward.stars)
        : 0,
      coins: Number.isFinite(savedReward.coins)
        ? Math.max(0, savedReward.coins)
        : 0,
      streak: {
        ...defaultReward.streak,
        ...(savedReward.streak ?? {}),
      },
    }
    // 星星数是奖励解锁的事实来源；修复旧数据中星星足够但车厢未补齐的情况。
    const unlocked = carriagesUnlockedByStars(out.rewardsByProfile[p.id].stars)
    out.rewardsByProfile[p.id].unlockedCarriages = unlocked
    const savedOrder = Array.isArray(out.rewardsByProfile[p.id].trainOrder)
      ? out.rewardsByProfile[p.id].trainOrder
      : []
    out.rewardsByProfile[p.id].trainOrder = [
      ...new Set([
        ...savedOrder,
        ...unlocked,
      ]),
    ].filter((id) => unlocked.includes(id))
    if (dailyByProfile[p.id]) {
      out.dailyProgressByProfile[p.id] = dailyByProfile[p.id]
    }
  }

  // 校正 activeProfileId
  const validActive =
    typeof r.activeProfileId === 'string' &&
    profiles.some((p) => p.id === r.activeProfileId)
  out.activeProfileId = validActive
    ? (r.activeProfileId as string)
    : profiles[0].id

  return out
}

// 读取整个存储；按需迁移 v1。
export function loadAppStorage(): AppStorage {
  if (!hasLS()) return createFreshStorage()

  const rawV2 = safeParse<unknown>(localStorage.getItem(STORAGE_KEY))
  if (rawV2 && typeof rawV2 === 'object') {
    return normalizeAppStorage(rawV2)
  }

  // 无 v2 → 检测 v1
  const v1settings = safeParse<Partial<ProfileSettings>>(
    localStorage.getItem(V1_SETTINGS_KEY),
  )
  const v1history = safeParse<Parameters<typeof migrateStorageV1ToV2>[1]>(
    localStorage.getItem(V1_HISTORY_KEY),
  )
  if (v1settings || v1history) {
    const migrated = migrateStorageV1ToV2(v1settings, v1history)
    saveAppStorage(migrated)
    return migrated
  }

  // 全新
  const fresh = createFreshStorage()
  saveAppStorage(fresh)
  return fresh
}

export function saveAppStorage(s: AppStorage): void {
  if (!hasLS()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* 忽略写入失败（隐私模式 / 配额） */
  }
}

// 以「读取-修改-保存」方式安全更新，返回最新存储
export function updateAppStorage(
  mutate: (s: AppStorage) => void,
): AppStorage {
  const s = loadAppStorage()
  mutate(s)
  saveAppStorage(s)
  return s
}

// ---------------------------------------------------------------------------
// 选择器 / 档案 CRUD
// ---------------------------------------------------------------------------

export function getActiveProfile(s: AppStorage): ChildProfile | null {
  if (!s.activeProfileId) return s.profiles[0] ?? null
  return s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0] ?? null
}

export function getProfileSettings(
  s: AppStorage,
  profileId: string,
): ProfileSettings {
  return {
    ...DEFAULT_PROFILE_SETTINGS,
    ...(s.settingsByProfile[profileId] ?? {}),
  }
}

export function setActiveProfile(profileId: string): AppStorage {
  return updateAppStorage((s) => {
    if (s.profiles.some((p) => p.id === profileId)) {
      s.activeProfileId = profileId
    }
  })
}

export function addProfile(
  partial: Parameters<typeof createProfile>[0],
): { storage: AppStorage; profile: ChildProfile } {
  const profile = createProfile(partial)
  const storage = updateAppStorage((s) => {
    s.profiles.push(profile)
    s.settingsByProfile[profile.id] = { ...DEFAULT_PROFILE_SETTINGS }
    s.historyByProfile[profile.id] = []
    s.wrongQuestionsByProfile[profile.id] = []
    s.rewardsByProfile[profile.id] = createDefaultRewardState(0)
    s.activeProfileId = profile.id
  })
  return { storage, profile }
}

export function updateProfile(
  profileId: string,
  patch: Partial<ChildProfile>,
): AppStorage {
  return updateAppStorage((s) => {
    const idx = s.profiles.findIndex((p) => p.id === profileId)
    if (idx >= 0) {
      s.profiles[idx] = { ...s.profiles[idx], ...patch, id: profileId }
    }
  })
}

export function removeProfile(profileId: string): AppStorage {
  return updateAppStorage((s) => {
    s.profiles = s.profiles.filter((p) => p.id !== profileId)
    delete s.settingsByProfile[profileId]
    delete s.historyByProfile[profileId]
    delete s.wrongQuestionsByProfile[profileId]
    delete s.rewardsByProfile[profileId]
    delete s.dailyProgressByProfile[profileId]
    if (s.activeProfileId === profileId) {
      s.activeProfileId = s.profiles[0]?.id ?? null
    }
  })
}

export function saveProfileSettings(
  profileId: string,
  settings: ProfileSettings,
): AppStorage {
  return updateAppStorage((s) => {
    s.settingsByProfile[profileId] = settings
  })
}

// ---------------------------------------------------------------------------
// 练习结算：历史、奖励、连续练习、长期错题本
// ---------------------------------------------------------------------------

export function questionSignature(q: Question): string {
  return `${q.fullLeft}|${q.operation}|${q.fullRight}|${q.fullResult}|${q.pattern}`
}

export interface LearningResultParams {
  profileId: string
  settings: PracticeSettings
  result: PracticeResult
}

export interface LearningResultUpdate {
  storage: AppStorage
  newlyUnlocked: Carriage[]
}

// 纯数据更新，便于单测；会原地更新传入的 storage。
export function applyLearningResult(
  storage: AppStorage,
  { profileId, settings, result }: LearningResultParams,
): Carriage[] {
  const now = new Date()
  const nowIso = now.toISOString()
  const totalDuration = result.records.reduce(
    (sum, record) => sum + record.durationMs,
    0,
  )

  const history = storage.historyByProfile[profileId] ?? []
  history.unshift({
    id: genId('hist'),
    profileId,
    startedAt: new Date(now.getTime() - totalDuration).toISOString(),
    completedAt: nowIso,
    settings,
    totalQuestions: result.total,
    correctQuestions: result.correctCount,
    accuracy: result.accuracy,
    totalAttempts: result.records.reduce(
      (sum, record) => sum + record.attempts,
      0,
    ),
    hintCount: result.hintsUsed,
    averageDurationMs:
      result.total > 0 ? Math.round(totalDuration / result.total) : 0,
    bestStreak: result.bestStreak,
    earnedStars: result.stars,
    difficultyStart: storage.profiles.find((p) => p.id === profileId)?.currentLevel ?? '',
    difficultyEnd: storage.profiles.find((p) => p.id === profileId)?.currentLevel ?? '',
  })
  storage.historyByProfile[profileId] = history.slice(0, 200)

  const reward = storage.rewardsByProfile[profileId] ?? createDefaultRewardState(0)
  const beforeUnlocked = new Set(reward.unlockedCarriages)
  reward.stars += result.stars
  reward.coins += result.stars
  reward.unlockedCarriages = carriagesUnlockedByStars(reward.stars)
  reward.trainOrder = [
    ...new Set([...reward.trainOrder, ...reward.unlockedCarriages]),
  ].filter((id) => reward.unlockedCarriages.includes(id))

  const today = todayStr()
  if (reward.streak.lastActiveDate !== today) {
    reward.streak.current = reward.streak.lastActiveDate &&
      dayDiff(reward.streak.lastActiveDate, today) === 1
      ? reward.streak.current + 1
      : 1
    reward.streak.longest = Math.max(
      reward.streak.longest,
      reward.streak.current,
    )
    reward.streak.lastActiveDate = today
  }
  storage.rewardsByProfile[profileId] = reward

  const daily = storage.dailyProgressByProfile[profileId]
  const currentDaily = daily?.date === today
    ? daily
    : {
        date: today,
        completed: false,
        targetQuestions: 10,
        doneQuestions: 0,
        earnedStars: 0,
      }
  currentDaily.doneQuestions += result.total
  currentDaily.earnedStars += result.stars
  currentDaily.completed = currentDaily.doneQuestions >= currentDaily.targetQuestions
  storage.dailyProgressByProfile[profileId] = currentDaily

  const recordsById = new Map(
    result.records.map((record) => [record.questionId, record]),
  )
  const wrongBook = storage.wrongQuestionsByProfile[profileId] ?? []

  for (const question of result.questions) {
    const answerRecord = recordsById.get(question.id)
    if (!answerRecord) continue
    const signature = questionSignature(question)
    const existing = wrongBook.find(
      (item) =>
        item.question.id === question.id ||
        questionSignature(item.question) === signature,
    )

    if (answerRecord.isCorrect) {
      if (existing) {
        existing.correctCountAfterWrong += 1
        existing.mastered = existing.correctCountAfterWrong >= 2
        existing.lastPracticedAt = nowIso
      }
      continue
    }

    if (existing) {
      existing.question = question
      existing.wrongAnswers = [
        ...existing.wrongAnswers,
        ...(answerRecord.wrongAnswers ?? []),
      ].slice(-8)
      existing.attempts += answerRecord.attempts
      existing.usedHint ||= answerRecord.usedHint
      existing.lastPracticedAt = nowIso
      existing.correctCountAfterWrong = 0
      existing.mastered = false
    } else {
      wrongBook.unshift({
        id: genId('wrong'),
        question,
        wrongAnswers: answerRecord.wrongAnswers ?? [],
        attempts: answerRecord.attempts,
        usedHint: answerRecord.usedHint,
        createdAt: nowIso,
        lastPracticedAt: nowIso,
        correctCountAfterWrong: 0,
        mastered: false,
      })
    }
  }
  storage.wrongQuestionsByProfile[profileId] = wrongBook.slice(0, 200)

  return reward.unlockedCarriages
    .filter((id) => !beforeUnlocked.has(id))
    .map(getCarriage)
    .filter((item): item is Carriage => Boolean(item))
}

export function recordLearningResult(
  params: LearningResultParams,
): LearningResultUpdate {
  const storage = loadAppStorage()
  const newlyUnlocked = applyLearningResult(storage, params)
  saveAppStorage(storage)
  return { storage, newlyUnlocked }
}

export function clearMasteredWrongQuestions(profileId: string): AppStorage {
  return updateAppStorage((storage) => {
    storage.wrongQuestionsByProfile[profileId] = (
      storage.wrongQuestionsByProfile[profileId] ?? []
    ).filter((item) => !item.mastered)
  })
}

export function selectRewardHead(
  profileId: string,
  carriageId: string,
): AppStorage {
  return updateAppStorage((storage) => {
    const reward = storage.rewardsByProfile[profileId]
    const carriage = getCarriage(carriageId)
    if (
      reward &&
      carriage?.kind === 'head' &&
      reward.unlockedCarriages.includes(carriageId)
    ) {
      reward.selectedHead = carriageId
    }
  })
}
