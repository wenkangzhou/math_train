import type {
  PracticeSettings,
  Question,
  StoredHistory,
  HistoryEntry,
} from '@/types/math'

const SETTINGS_KEY = 'math-practice-settings'
const HISTORY_KEY = 'math-practice-history'

export const DEFAULT_SETTINGS: PracticeSettings = {
  selectedRanges: ['addition-within-10'],
  selectedPatterns: ['a-plus-b-equals-blank', 'a-minus-b-equals-blank'],
  questionCount: 10,
  autoShowVisualHint: false,
  showHintAfterWrongAnswer: true,
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function loadSettings(): PracticeSettings {
  if (typeof localStorage === 'undefined') return DEFAULT_SETTINGS
  const stored = safeParse<Partial<PracticeSettings>>(
    localStorage.getItem(SETTINGS_KEY),
  )
  if (!stored) return DEFAULT_SETTINGS
  // 与默认值合并，容错旧数据
  return { ...DEFAULT_SETTINGS, ...stored }
}

export function saveSettings(settings: PracticeSettings): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    /* 忽略写入失败（如隐私模式） */
  }
}

const EMPTY_HISTORY: StoredHistory = {
  totalStars: 0,
  entries: [],
  lastWrongQuestions: [],
}

export function loadHistory(): StoredHistory {
  if (typeof localStorage === 'undefined') return EMPTY_HISTORY
  const stored = safeParse<StoredHistory>(localStorage.getItem(HISTORY_KEY))
  if (!stored) return EMPTY_HISTORY
  return { ...EMPTY_HISTORY, ...stored }
}

export function saveHistory(history: StoredHistory): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {
    /* 忽略 */
  }
}

// 记录一次完成的练习，返回更新后的历史
export function recordPractice(params: {
  entry: HistoryEntry
  earnedStars: number
  wrongQuestions: Question[]
}): StoredHistory {
  const prev = loadHistory()
  const next: StoredHistory = {
    totalStars: prev.totalStars + params.earnedStars,
    entries: [params.entry, ...prev.entries].slice(0, 20),
    lastWrongQuestions: params.wrongQuestions,
  }
  saveHistory(next)
  return next
}
