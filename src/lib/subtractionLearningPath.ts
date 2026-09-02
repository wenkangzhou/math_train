import type {
  PracticeSettings,
  QuestionCount,
  QuestionFormat,
  QuestionPattern,
  RangeType,
  SkillTag,
  SubtractionLearningStageId,
} from '@/types/math'
import type { PracticeHistoryItem } from '@/types/storage'

export interface SubtractionLearningStage {
  id: SubtractionLearningStageId
  step: 1 | 2 | 3 | 4
  emoji: string
  label: string
  example: string
  skill: SkillTag | null
  autoOpenHint: boolean
  previewRemoval: boolean
}

export const DEFAULT_SUBTRACTION_STAGE: SubtractionLearningStageId = 'take-ones'

export const SUBTRACTION_STAGES: SubtractionLearningStage[] = [
  {
    id: 'take-ones',
    step: 1,
    emoji: '🍎',
    label: '先从个位拿',
    example: '15 − 2',
    skill: 'sub20-teen-minus-unit',
    autoOpenHint: true,
    previewRemoval: true,
  },
  {
    id: 'break-ten',
    step: 2,
    emoji: '🔟',
    label: '个位不够，从十里拿',
    example: '13 − 8',
    skill: 'sub20-break-ten',
    autoOpenHint: false,
    previewRemoval: true,
  },
  {
    id: 'take-ten',
    step: 3,
    emoji: '🚚',
    label: '先拿走一整组十',
    example: '19 − 11',
    skill: 'sub20-take-ten',
    autoOpenHint: false,
    previewRemoval: false,
  },
  {
    id: 'mixed',
    step: 4,
    emoji: '🏁',
    label: '三种方法混合练',
    example: '随机挑战',
    skill: null,
    autoOpenHint: false,
    previewRemoval: false,
  },
]

export function isSubtractionLearningStage(
  value: unknown,
): value is SubtractionLearningStageId {
  return SUBTRACTION_STAGES.some((stage) => stage.id === value)
}

export function getSubtractionStage(
  id: SubtractionLearningStageId | string | undefined,
): SubtractionLearningStage {
  return SUBTRACTION_STAGES.find((stage) => stage.id === id) ?? SUBTRACTION_STAGES[0]
}

interface PathEligibilitySettings {
  selectedRanges: RangeType[]
  selectedPatterns: QuestionPattern[]
  skillTags?: SkillTag[]
  adaptiveDifficulty?: boolean
}

/**
 * 只在家长明确选择“20 以内减法 + 普通结果题”时接管出题。
 * 自动难度或专项技能开启时，继续尊重原来的设置。
 */
export function isSubtractionPathEligible(
  settings: PathEligibilitySettings,
): boolean {
  const subtractionPatterns = settings.selectedPatterns.filter((pattern) =>
    pattern.includes('minus'),
  )
  return (
    settings.adaptiveDifficulty !== true &&
    settings.selectedRanges.length === 1 &&
    settings.selectedRanges[0] === 'subtraction-within-20' &&
    (settings.skillTags?.length ?? 0) === 0 &&
    subtractionPatterns.length === 1 &&
    subtractionPatterns[0] === 'a-minus-b-equals-blank'
  )
}

type RoutedSettings = PracticeSettings & {
  questionFormats?: QuestionFormat[]
  skillTags?: SkillTag[]
  adaptiveDifficulty?: boolean
}

/** 每关都是短途 5 题；只使用标准算式，具体视觉解释交给“帮帮我”。 */
export function settingsForSubtractionStage<T extends RoutedSettings>(
  settings: T,
  stageId: SubtractionLearningStageId,
): T {
  const stage = getSubtractionStage(stageId)
  return {
    ...settings,
    selectedRanges: ['subtraction-within-20'],
    selectedPatterns: ['a-minus-b-equals-blank'],
    questionCount: 5 as QuestionCount,
    questionFormats: ['equation'],
    skillTags: [],
    autoShowVisualHint: stage.autoOpenHint,
    showHintAfterWrongAnswer: true,
    subtractionLearningStage: stage.id,
  }
}

function shuffle<T>(values: T[]): T[] {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** 混合关固定覆盖三种方法，其余两题用于变化；避免随机遗漏某一类。 */
export function skillSequenceForSubtractionStage(
  stageId: SubtractionLearningStageId,
  count: number,
): SkillTag[] {
  const stage = getSubtractionStage(stageId)
  if (stage.skill) return Array.from({ length: count }, () => stage.skill as SkillTag)

  const core: SkillTag[] = [
    'sub20-teen-minus-unit',
    'sub20-break-ten',
    'sub20-take-ten',
  ]
  const sequence = [...core]
  while (sequence.length < count) {
    sequence.push(core[sequence.length % core.length])
  }
  return shuffle(sequence.slice(0, count))
}

export interface SubtractionStageChange {
  from: SubtractionLearningStageId
  to: SubtractionLearningStageId
}

/**
 * 连续两趟稳定完成才晋级。第一关会自动打开完整提示，因此不限制提示次数；
 * 后续关卡逐步要求孩子少依赖提示，但绝不因一次状态不好而倒退。
 */
export function nextSubtractionStage(
  currentId: SubtractionLearningStageId,
  history: PracticeHistoryItem[],
): SubtractionLearningStageId {
  const current = getSubtractionStage(currentId)
  if (current.id === 'mixed') return current.id

  const recent = history
    .filter(
      (item) =>
        item.sessionKind !== 'review' &&
        item.settings.subtractionLearningStage === current.id,
    )
    .slice(0, 2)
  if (recent.length < 2) return current.id

  const maxHintRatio = current.id === 'take-ones'
    ? 1
    : current.id === 'break-ten'
      ? 0.7
      : 0.5
  const ready = recent.every((item) => {
    const hintRatio = item.totalQuestions > 0
      ? item.hintCount / item.totalQuestions
      : 1
    const attemptsPerQuestion = item.totalQuestions > 0
      ? item.totalAttempts / item.totalQuestions
      : Number.POSITIVE_INFINITY
    return item.accuracy >= 0.8 && hintRatio <= maxHintRatio && attemptsPerQuestion <= 1.4
  })
  if (!ready) return current.id

  return SUBTRACTION_STAGES[current.step]?.id ?? current.id
}
