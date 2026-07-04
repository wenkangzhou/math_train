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

// 第二版：题目呈现格式（可多选）
//  - equation：传统算式题（v1 行为）
//  - picture：图片数量题（不直接给完整算式）
//  - story：1~2 句话的故事题
export type QuestionFormat = 'equation' | 'picture' | 'story'

// 第二版：难度细分技能标签（高级设置 / 自适应使用）。
// 留空时按 RangeType 的粗粒度生成（兼容 v1）。
export type SkillTag =
  // 10 以内加法
  | 'add10-within5'
  | 'add10-no-zero'
  | 'add10-with-zero'
  | 'add10-make5'
  | 'add10-make10'
  // 10 以内减法
  | 'sub10-within5'
  | 'sub10-basic'
  | 'sub10-result-zero'
  | 'sub10-minus-zero'
  | 'sub10-inverse'
  // 20 以内加法
  | 'add20-ten-plus'
  | 'add20-teen-plus-unit'
  | 'add20-no-carry'
  | 'add20-carry'
  | 'add20-make-ten'
  // 20 以内减法
  | 'sub20-teen-minus-unit'
  | 'sub20-no-borrow'
  | 'sub20-borrow'
  | 'sub20-break-ten'
  | 'sub20-inverse'

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
  // —— 第二版新增（全部可选，兼容 v1 题目）——
  // 呈现格式；缺省视为 'equation'
  format?: QuestionFormat
  // 细分技能标签（若由细分生成器产出）
  skill?: SkillTag
  // 故事题文案（1~2 句）；format==='story' 时使用
  story?: string
  // 故事/图片题的主角与场景（用于朗读与插图）
  storyActor?: string
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
  // 本题曾输入过的错误答案，用于长期错题本分析。
  wrongAnswers?: number[]
  // 本题权重星数（按难度加权），仅在 isCorrect 时有效
  questionStarWeight?: number
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
  // 从进入答题页到完成本轮练习的连续用时。
  durationMs: number
  stars: number
  correctCount: number
  total: number
  accuracy: number
  bestStreak: number
  hintsUsed: number
  wrongQuestions: Question[]
}
