import type {
  Operation,
  PracticeSettings,
  QuestionPattern,
  RangeType,
  SkillTag,
} from '@/types/math'
import type { PracticeHistoryItem } from '@/types/storage'

export interface DifficultyLevel {
  id: string
  label: string
  description: string
  max: 10 | 20
  patternTier: 0 | 1 | 2
  numberDifficulty: number
}

export const DIFFICULTY_LADDER: DifficultyLevel[] = [
  { id: 'add10-basic', label: '10以内起步', description: '较小数字和基础算式', max: 10, patternTier: 0, numberDifficulty: 0.1 },
  { id: 'within10-steady', label: '10以内熟练', description: '数字逐渐接近10', max: 10, patternTier: 0, numberDifficulty: 0.45 },
  { id: 'within10-missing', label: '10以内缺项', description: '加入中间缺少数字的题', max: 10, patternTier: 1, numberDifficulty: 0.6 },
  { id: 'within10-reverse', label: '10以内进阶', description: '加入开头缺少数字的题', max: 10, patternTier: 2, numberDifficulty: 0.85 },
  { id: 'within20-steady', label: '20以内起步', description: '进入20以内基础算式', max: 20, patternTier: 0, numberDifficulty: 0.55 },
  { id: 'within20-missing', label: '20以内进阶', description: '20以内多种缺项题', max: 20, patternTier: 2, numberDifficulty: 0.85 },
]

const STANDARD: Record<Operation, QuestionPattern> = {
  addition: 'a-plus-b-equals-blank',
  subtraction: 'a-minus-b-equals-blank',
}

const MIDDLE: Record<Operation, QuestionPattern> = {
  addition: 'a-plus-blank-equals-c',
  subtraction: 'a-minus-blank-equals-c',
}

const REVERSE: Record<Operation, QuestionPattern> = {
  addition: 'blank-plus-b-equals-c',
  subtraction: 'blank-minus-b-equals-c',
}

export interface AdaptiveSettings extends PracticeSettings {
  adaptiveDifficulty?: boolean
  allowHarder?: boolean
  skillTags?: SkillTag[]
  adaptiveNumberDifficulty?: number
}

function levelIndex(levelId: string): number {
  const index = DIFFICULTY_LADDER.findIndex((level) => level.id === levelId)
  return index >= 0 ? index : 0
}

export function getDifficultyLevel(levelId: string): DifficultyLevel {
  return DIFFICULTY_LADDER[levelIndex(levelId)]
}

export function getDifficultyLabel(levelId: string): string {
  return getDifficultyLevel(levelId).label
}

function selectedOperations(ranges: RangeType[]): Operation[] {
  const operations = new Set<Operation>()
  for (const range of ranges) {
    operations.add(range.startsWith('addition') ? 'addition' : 'subtraction')
  }
  return operations.size > 0 ? [...operations] : ['addition']
}

function rangeFor(operation: Operation, max: 10 | 20): RangeType {
  return `${operation === 'addition' ? 'addition' : 'subtraction'}-within-${max}` as RangeType
}

function patternsFor(operation: Operation, tier: 0 | 1 | 2): QuestionPattern[] {
  const patterns = [STANDARD[operation]]
  if (tier >= 1) patterns.push(MIDDLE[operation])
  if (tier >= 2) patterns.push(REVERSE[operation])
  return patterns
}

export function settingsForDifficulty<T extends AdaptiveSettings>(
  settings: T,
  levelId: string,
): T & { adaptiveNumberDifficulty: number } {
  if (!settings.adaptiveDifficulty) {
    return { ...settings, adaptiveNumberDifficulty: 0.5 }
  }

  const level = getDifficultyLevel(levelId)
  const operations = selectedOperations(settings.selectedRanges)
  const mayUse20 = Boolean(settings.allowHarder)
  const max: 10 | 20 = level.max === 20 && mayUse20 ? 20 : 10

  return {
    ...settings,
    selectedRanges: operations.map((operation) => rangeFor(operation, max)),
    selectedPatterns: operations.flatMap((operation) =>
      patternsFor(operation, level.patternTier),
    ),
    // 自动模式统一管理难度；专项技能保留在设置里，但本轮暂不套用。
    skillTags: [],
    adaptiveNumberDifficulty: level.numberDifficulty,
  }
}

function isStrongSession(session: PracticeHistoryItem): boolean {
  if (session.totalQuestions < 5) return false
  const hints = session.hintCount / Math.max(1, session.totalQuestions)
  const attempts = session.totalAttempts / Math.max(1, session.totalQuestions)
  return session.accuracy >= 0.9 && hints <= 0.25 && attempts <= 1.25
}

function isStrugglingSession(session: PracticeHistoryItem): boolean {
  const hints = session.hintCount / Math.max(1, session.totalQuestions)
  const attempts = session.totalAttempts / Math.max(1, session.totalQuestions)
  return session.accuracy < 0.6 || hints >= 0.6 || attempts >= 2
}

export function nextAdaptiveLevel(
  currentLevelId: string,
  recentSessions: PracticeHistoryItem[],
  settings: Pick<AdaptiveSettings, 'selectedRanges' | 'allowHarder'>,
): string {
  const currentIndex = levelIndex(currentLevelId)
  const regularSessions = recentSessions
    .filter((session) => session.sessionKind !== 'review')
    .slice(0, 2)
  const latest = regularSessions[0]

  if (latest && isStrugglingSession(latest)) {
    return DIFFICULTY_LADDER[Math.max(0, currentIndex - 1)].id
  }

  const maxIndex = settings.allowHarder
    ? DIFFICULTY_LADDER.length - 1
    : DIFFICULTY_LADDER.findIndex((level) => level.id === 'within10-reverse')

  if (
    regularSessions.length >= 2 &&
    regularSessions.every(isStrongSession) &&
    currentIndex < maxIndex
  ) {
    return DIFFICULTY_LADDER[currentIndex + 1].id
  }

  return DIFFICULTY_LADDER[Math.min(currentIndex, maxIndex)].id
}
