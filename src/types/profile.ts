// 数数小火车 / Math Train — 第二版：儿童档案与个性化设置类型

import type {
  PracticeSettings,
  QuestionFormat,
  SkillTag,
  VisualTheme,
} from './math'

// 内置头像（首版使用 emoji / 内置 SVG，保留可替换接口）
export type AvatarId =
  | 'bear'
  | 'rabbit'
  | 'cat'
  | 'dog'
  | 'duck'
  | 'train'

// 语速
export type SpeechRate = 'slow' | 'normal' | 'fast'

// 动画强度
export type AnimationLevel = 'less' | 'standard' | 'rich'

// 提示方式
export type HintMode = 'picture' | 'numberline' | 'drag'

// 儿童档案（本地多档案，最多 4 个）
export interface ChildProfile {
  id: string
  name: string
  avatar: AvatarId
  birthYear?: number
  // 当前难度阶段 id（见 lib/adaptiveDifficulty 的 LADDER）
  currentLevel: string
  preferredTheme: VisualTheme
  createdAt: string
}

// 每个档案的完整设置：在 v1 PracticeSettings 之上扩展第二版选项。
export interface ProfileSettings extends PracticeSettings {
  // 题目呈现格式（可多选：算式 / 图片 / 故事）
  questionFormats: QuestionFormat[]
  // 高级细分技能（留空=按 selectedRanges 粗粒度）
  skillTags: SkillTag[]
  // 默认提示方式
  preferredHint: HintMode

  // —— 语音 & 音效 ——
  autoReadQuestion: boolean
  autoReadFeedback: boolean
  speechRate: SpeechRate
  speechVoiceId: string
  soundEnabled: boolean

  // —— 动画 ——
  animationLevel: AnimationLevel

  // —— 难度 ——
  adaptiveDifficulty: boolean
  allowHarder: boolean
  allowTimer: boolean
}
