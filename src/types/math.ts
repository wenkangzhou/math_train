// 数数小火车 / Math Train — 核心数据类型
// 题目生成逻辑与 UI 分离，类型集中在此文件。

export type Operation = 'addition' | 'subtraction'

export type RangeType =
  | 'addition-within-10'
  | 'subtraction-within-10'
  | 'addition-within-20'
  | 'subtraction-within-20'

export type QuestionPattern =
  | 'a-plus-b-equals-blank' // 3 + 2 = ?
  | 'a-plus-blank-equals-c' // 3 + ? = 5
  | 'blank-plus-b-equals-c' // ? + 2 = 5
  | 'a-minus-b-equals-blank' // 5 - 2 = ?
  | 'a-minus-blank-equals-c' // 5 - ? = 3
  | 'blank-minus-b-equals-c' // ? - 2 = 3

// 可视化提示素材主题（首版使用 emoji，结构方便未来替换为正式插画）
export type VisualTheme =
  | 'car'
  | 'apple'
  | 'star'
  | 'fish'
  | 'carrot'
  | 'block'
  | 'balloon'
  | 'duck'

export interface Question {
  id: string
  operation: Operation
  range: 10 | 20
  pattern: QuestionPattern
  // null 表示题目中需要填写（被隐藏）的位置
  left: number | null
  right: number | null
  result: number | null
  answer: number
  // 始终保留完整等式的三个数字，便于可视化提示渲染
  fullLeft: number
  fullRight: number
  fullResult: number
  visualTheme: VisualTheme
}

export type QuestionCount = 5 | 10 | 20

export interface PracticeSettings {
  selectedRanges: RangeType[]
  selectedPatterns: QuestionPattern[]
  questionCount: QuestionCount
  autoShowVisualHint: boolean
  showHintAfterWrongAnswer: boolean
}

export interface AnswerRecord {
  questionId: string
  answer: number
  isCorrect: boolean
  attempts: number
  usedHint: boolean
  durationMs: number
}

export interface PracticeSession {
  questions: Question[]
  currentIndex: number
  records: AnswerRecord[]
  stars: number
  currentStreak: number
  bestStreak: number
}

// 本地存储中保存的一条历史记录
export interface HistoryEntry {
  date: number
  total: number
  correct: number
  stars: number
  bestStreak: number
  accuracy: number
}

export interface StoredHistory {
  totalStars: number
  entries: HistoryEntry[]
  // 最近一次的错题，便于「练习错题」
  lastWrongQuestions: Question[]
}

// 一次练习完成后的汇总结果
export interface PracticeResult {
  questions: Question[]
  records: AnswerRecord[]
  stars: number
  correctCount: number
  total: number
  accuracy: number
  bestStreak: number
  hintsUsed: number
  wrongQuestions: Question[]
}
