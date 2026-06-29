// 数数小火车 / Math Train — 第二版：统一本地存储结构与版本

import type { PracticeSettings, Question } from './math'
import type { ChildProfile, ProfileSettings } from './profile'
import type { RewardState } from './rewards'

export const STORAGE_VERSION = 2
export const STORAGE_KEY = 'math-train:v2'

// 错题记录
export interface WrongQuestionRecord {
  id: string
  question: Question
  wrongAnswers: number[]
  attempts: number
  usedHint: boolean
  createdAt: string
  lastPracticedAt: string
  // 加入错题本后累计答对次数（用于「巩固→掌握」）
  correctCountAfterWrong: number
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
