// 数数小火车 / Math Train — 第二版：统一本地存储结构与版本

import type { PracticeSettings, Question } from './math'
import type { ChildProfile, ProfileSettings } from './profile'
import type { RewardState } from './rewards'

export const STORAGE_VERSION = 2
export const STORAGE_KEY = 'math-train:v2'

export type WrongReviewStage = 0 | 1 | 2 | 3

// 错题记录
export interface WrongQuestionRecord {
  id: string
  question: Question
  wrongAnswers: number[]
  attempts: number
  usedHint: boolean
  createdAt: string
  lastPracticedAt: string
  // 旧字段名保留兼容；现在与 reviewStage 同步，不再按同日累计答对。
  correctCountAfterWrong: number
  // 已通过的间隔复习阶段：0=未通过，1=隔天，2=3天，3=7天并掌握。
  reviewStage: WrongReviewStage
  nextReviewAt: string // 本地日期 yyyy-mm-dd；已掌握时为空
  lastReviewDate: string // 最近一次有效复习的本地日期
  mastered: boolean
}

// 一条练习历史
export interface PracticeHistoryItem {
  id: string
  profileId: string
  startedAt: string
  completedAt: string
  settings: PracticeSettings
  totalQuestions: number
  correctQuestions: number
  accuracy: number
  totalAttempts: number
  hintCount: number
  averageDurationMs: number
  bestStreak: number
  earnedStars: number
  difficultyStart: string
  difficultyEnd: string
  sessionKind?: 'regular' | 'review'
}

// 每日练习进度
export interface DailyProgress {
  date: string // yyyy-mm-dd
  completed: boolean
  targetQuestions: number
  doneQuestions: number
  earnedStars: number
}

// 统一应用存储（按档案分区）
export interface AppStorage {
  version: number
  activeProfileId: string | null
  profiles: ChildProfile[]
  settingsByProfile: Record<string, ProfileSettings>
  historyByProfile: Record<string, PracticeHistoryItem[]>
  wrongQuestionsByProfile: Record<string, WrongQuestionRecord[]>
  rewardsByProfile: Record<string, RewardState>
  dailyProgressByProfile: Record<string, DailyProgress>
}
