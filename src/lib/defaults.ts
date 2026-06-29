// 数数小火车 / Math Train — 第二版各类默认值与工厂函数

import type { ProfileSettings, ChildProfile, AvatarId } from '@/types/profile'
import type { RewardState } from '@/types/rewards'
import type { DailyProgress } from '@/types/storage'
import { DEFAULT_SETTINGS } from './storage'
import {
  DEFAULT_HEAD_ID,
  carriagesUnlockedByStars,
} from './carriages'
import { genId } from './id'
import { todayStr } from './date'

// 默认难度阶段（见 adaptiveDifficulty 的 LADDER）
export const DEFAULT_LEVEL = 'add10-basic'

// 档案默认设置：在 v1 PracticeSettings 基础上补齐第二版字段。
export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  ...DEFAULT_SETTINGS,
  questionFormats: ['equation'],
  skillTags: [],
  preferredHint: 'picture',
  autoReadQuestion: false,
  autoReadFeedback: false,
  speechRate: 'normal',
  soundEnabled: true,
  animationLevel: 'standard',
  adaptiveDifficulty: false,
  allowHarder: false,
  allowTimer: false,
}

export function createDefaultRewardState(initialStars = 0): RewardState {
  const unlocked = carriagesUnlockedByStars(initialStars)
  return {
    coins: 0,
    stars: initialStars,
    stickers: [],
    unlockedCarriages: unlocked,
    selectedHead: DEFAULT_HEAD_ID,
    trainOrder: unlocked,
    streak: { current: 0, longest: 0, lastActiveDate: '' },
  }
}

export function createDefaultDailyProgress(): DailyProgress {
  return {
    date: todayStr(),
    completed: false,
    targetQuestions: 7,
    doneQuestions: 0,
    earnedStars: 0,
  }
}

export function createProfile(
  partial: Partial<ChildProfile> & { name: string; avatar: AvatarId },
): ChildProfile {
  return {
    id: partial.id ?? genId('profile'),
    name: partial.name,
    avatar: partial.avatar,
    birthYear: partial.birthYear,
    currentLevel: partial.currentLevel ?? DEFAULT_LEVEL,
    preferredTheme: partial.preferredTheme ?? 'car',
    createdAt: partial.createdAt ?? new Date().toISOString(),
  }
}

export const MAX_PROFILES = 4

// 默认头像顺序（新建档案时轮换建议）
export const AVATAR_OPTIONS: { id: AvatarId; emoji: string; label: string }[] = [
  { id: 'bear', emoji: '🐻', label: '小熊' },
  { id: 'rabbit', emoji: '🐰', label: '小兔' },
  { id: 'cat', emoji: '🐱', label: '小猫' },
  { id: 'dog', emoji: '🐶', label: '小狗' },
  { id: 'duck', emoji: '🦆', label: '小鸭' },
  { id: 'train', emoji: '🚂', label: '小火车' },
]

export function avatarEmoji(id: AvatarId): string {
  return AVATAR_OPTIONS.find((a) => a.id === id)?.emoji ?? '🚂'
}
