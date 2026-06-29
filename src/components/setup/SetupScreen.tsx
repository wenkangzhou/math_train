import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  ChevronRight,
  Clock3,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trophy,
} from 'lucide-react'
import type {
  PracticeSettings,
  QuestionCount,
  QuestionFormat,
  QuestionPattern,
  RangeType,
  SkillTag,
  StoredHistory,
} from '@/types/math'
import {
  ADDITION_PATTERNS,
  SUBTRACTION_PATTERNS,
} from '@/lib/questionGenerator'
import { MascotHeader } from './MascotHeader'
import { RangeSelector } from './RangeSelector'
import { PatternSelector } from './PatternSelector'
import { QuestionCountSelector } from './QuestionCountSelector'
import { HintSettings } from './HintSettings'
import { AdvancedSettingsDrawer } from './AdvancedSettingsDrawer'
import { SectionCard } from '@/components/common/SectionCard'
import { TrainMascot } from '@/components/common/TrainMascot'

export type StartSettings = PracticeSettings & {
  questionFormats: QuestionFormat[]
  skillTags: SkillTag[]
}

interface SetupScreenProps {
  initialSettings: PracticeSettings &
    Partial<Pick<StartSettings, 'questionFormats' | 'skillTags'>>
  history: StoredHistory
  onStart: (settings: StartSettings) => void
  onPracticeWrong: () => void
}

const FORMAT_OPTIONS: { id: QuestionFormat; label: string; emoji: string }[] = [
  { id: 'equation', label: '算式题', emoji: '🔢' },
  { id: 'picture', label: '图片题', emoji: '🖼️' },
  { id: 'story', label: '故事题', emoji: '📖' },
]

function isAddition(range: RangeType) {
  return range.startsWith('addition')
}

export function SetupScreen({
  initialSettings,
  history,
  onStart,
  onPracticeWrong,
}: SetupScreenProps) {
  const [ranges, setRanges] = useState<RangeType[]>(
    initialSettings.selectedRanges,
  )
  const [patterns, setPatterns] = useState<QuestionPattern[]>(
    initialSettings.selectedPatterns,
  )
  const [count, setCount] = useState<QuestionCount>(
    initialSettings.questionCount,
  )
  const [autoShowVisualHint, setAutoShow] = useState(
    initialSettings.autoShowVisualHint,
  )
  const [showHintAfterWrong, setAfterWrong] = useState(
    initialSettings.showHintAfterWrongAnswer,
  )
  const [formats, setFormats] = useState<QuestionFormat[]>(
    initialSettings.questionFormats ?? ['equation'],
  )
  const [skillTags, setSkillTags] = useState<SkillTag[]>(
    initialSettings.skillTags ?? [],
  )
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const toggleFormat = (f: QuestionFormat) => {
    setFormats((prev) => {
      if (prev.includes(f)) {
        const next = prev.filter((x) => x !== f)
        return next.length > 0 ? next : prev // 至少保留一个
      }
      return [...prev, f]
    })
  }

  const toggleSkill = (s: SkillTag) => {
    setSkillTags((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )
  }

  const hasAddition = ranges.some(isAddition)
  const hasSubtraction = ranges.some((r) => !isAddition(r))

  const toggleRange = (value: RangeType) => {
    setRanges((prev) => {
      const next = prev.includes(value)
        ? prev.filter((r) => r !== value)
        : [...prev, value]

      // 启用某运算但没有对应题型时，自动补上标准题型
      const nextHasAdd = next.some(isAddition)
      const nextHasSub = next.some((r) => !isAddition(r))
      setPatterns((prevPatterns) => {
        let p = [...prevPatterns]
        if (
          nextHasAdd &&
          !p.some((x) => ADDITION_PATTERNS.includes(x))
        ) {
          p.push('a-plus-b-equals-blank')
        }
        if (
          nextHasSub &&
          !p.some((x) => SUBTRACTION_PATTERNS.includes(x))
        ) {
          p.push('a-minus-b-equals-blank')
        }
        return p
      })

      return next
    })
  }

  const togglePattern = (value: QuestionPattern) => {
    setPatterns((prev) => {
      if (prev.includes(value)) {
        const next = prev.filter((p) => p !== value)
        // 至少保留一个与当前运算匹配的题型
        const isAdd = ADDITION_PATTERNS.includes(value)
        const sameOp = next.filter((p) =>
          isAdd
            ? ADDITION_PATTERNS.includes(p)
            : SUBTRACTION_PATTERNS.includes(p),
        )
        const opActive = isAdd ? hasAddition : hasSubtraction
        if (opActive && sameOp.length === 0) {
          return prev // 阻止取消最后一个
        }
        return next
      }
      return [...prev, value]
    })
  }

  const addSelected = patterns.filter((p) => ADDITION_PATTERNS.includes(p))
  const subSelected = patterns.filter((p) => SUBTRACTION_PATTERNS.includes(p))

  const canStart = useMemo(() => {
    if (ranges.length === 0) return false
    if (hasAddition && addSelected.length === 0) return false
    if (hasSubtraction && subSelected.length === 0) return false
    return true
  }, [ranges.length, hasAddition, hasSubtraction, addSelected.length, subSelected.length])

  const handleStart = () => {
    if (!canStart) return
    // 仅保留与已选运算匹配的题型，保证设置整洁
    const effectivePatterns = patterns.filter((p) =>
      ADDITION_PATTERNS.includes(p) ? hasAddition : hasSubtraction,
    )
    onStart({
      selectedRanges: ranges,
      selectedPatterns: effectivePatterns,
      questionCount: count,
      autoShowVisualHint,
      showHintAfterWrongAnswer: showHintAfterWrong,
      questionFormats: formats,
      skillTags,
    })
  }

  const totalQuestions = history.entries.reduce(
    (sum, entry) => sum + entry.total,
    0,
  )
  const latestAccuracy = history.entries[0]
    ? Math.round(history.entries[0].accuracy * 100)
    : null
  const todayKey = new Date().toDateString()
  const todayQuestions = history.entries
    .filter((entry) => new Date(entry.date).toDateString() === todayKey)
    .reduce((sum, entry) => sum + entry.total, 0)
  const dailyTarget = 10
  const dailyProgress = Math.min(100, (todayQuestions / dailyTarget) * 100)

  const rangeSummary = ranges.length === 0
    ? '还没选择范围'
    : ranges.length === 1
      ? ranges[0].includes('20') ? '20 以内' : '10 以内'
      : `${ranges.length} 个范围`

  const startButtonClass = [
    'flex w-full items-center justify-center gap-3 rounded-full py-4 text-xl font-extrabold text-white shadow-[0_12px_28px_-12px_rgba(255,138,101,0.8)] transition',
    'focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/60',
    canStart
      ? 'bg-gradient-to-r from-coral via-orange-400 to-amber-400 hover:-translate-y-0.5 hover:brightness-105'
      : 'cursor-not-allowed bg-slate-300',
  ].join(' ')

  return (
    <div className="mx-auto min-h-screen-safe max-w-6xl px-4 pb-32 pt-3 sm:px-6 ipad-land:flex ipad-land:flex-col ipad-land:px-7 ipad-land:pb-5 ipad-land:pt-4">
      <MascotHeader />

      <div className="mt-3 grid gap-4 ipad-land:min-h-0 ipad-land:flex-1 ipad-land:grid-cols-[minmax(290px,0.8fr)_minmax(0,2fr)] ipad-land:gap-5">
        {/* iPad 横屏的任务总览：让孩子先看到目标和主操作。 */}
        <aside className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-sky-deep via-sky to-cyan-300 p-5 text-white shadow-[0_22px_50px_-24px_rgba(43,143,214,0.8)] ipad-land:flex ipad-land:min-h-0 ipad-land:flex-col ipad-land:p-6">
          <div className="absolute -right-12 -top-14 h-44 w-44 rounded-full bg-white/15" />
          <div className="absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-white/10" />

          <div className="relative flex items-center gap-4 ipad-land:block ipad-land:text-center">
            <div className="shrink-0 rounded-[26px] bg-white/20 p-2 ring-1 ring-white/25 backdrop-blur ipad-land:mx-auto ipad-land:w-fit">
              <div className="ipad-land:scale-110">
                <TrainMascot mood="happy" size={90} />
              </div>
            </div>
            <div className="min-w-0 ipad-land:mt-3">
              <p className="text-sm font-bold text-white/75">今日小任务</p>
              <h2 className="mt-0.5 text-2xl font-extrabold ipad-land:text-3xl">
                准备好发车了吗？
              </h2>
              <p className="mt-1 text-sm font-medium text-white/80">
                每天练一点，算得越来越快
              </p>
            </div>
          </div>

          <div className="relative mt-5 rounded-3xl bg-white/15 p-4 ring-1 ring-white/20 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="flex items-center gap-2">
                <Target size={18} /> 今天已完成 {todayQuestions} 题
              </span>
              <span>{Math.min(todayQuestions, dailyTarget)}/{dailyTarget}</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-sky-950/15">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dailyProgress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-200"
              />
            </div>
            <p className="mt-2 text-xs text-white/70">
              {todayQuestions >= dailyTarget
                ? '今日任务完成，太棒啦！'
                : `再做 ${dailyTarget - todayQuestions} 题就完成今日任务`}
            </p>
          </div>

          <div className="relative mt-3 grid grid-cols-3 gap-2">
            <Metric icon={<Star size={17} fill="currentColor" />} value={history.totalStars} label="星星" />
            <Metric icon={<Trophy size={17} />} value={totalQuestions} label="已练题" />
            <Metric icon={<Clock3 size={17} />} value={latestAccuracy === null ? '—' : `${latestAccuracy}%`} label="上次" />
          </div>

          <div className="relative mt-5 hidden ipad-land:mt-auto ipad-land:block ipad-land:pt-5">
            <p className="mb-3 text-center text-sm font-semibold text-white/80">
              本次 · {rangeSummary} · {count} 题
            </p>
            {!canStart && (
              <p className="mb-2 text-center text-sm font-bold text-yellow-100">
                请先选择练习范围和对应题型
              </p>
            )}
            <motion.button
              type="button"
              disabled={!canStart}
              whileTap={canStart ? { scale: 0.96 } : undefined}
              onClick={handleStart}
              className={startButtonClass}
            >
              <Rocket size={25} /> 开始练习
            </motion.button>
            {history.lastWrongQuestions.length > 0 && (
              <button
                type="button"
                onClick={onPracticeWrong}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-white/15 py-3 text-base font-bold text-white ring-1 ring-white/25 transition hover:bg-white/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              >
                <BookOpen size={19} /> 错题加练 · {history.lastWrongQuestions.length} 题
              </button>
            )}
          </div>
        </aside>

        <main className="grid content-start gap-3 ipad-land:min-h-0 ipad-land:overflow-y-auto ipad-land:pr-1">
          <SectionCard title="1. 选择练习范围" hint="可以多选">
            <RangeSelector selected={ranges} onToggle={toggleRange} />
          </SectionCard>

          <SectionCard title="2. 选择算式题型" hint="蓝色表示已选择">
            <PatternSelector
              selected={patterns}
              additionEnabled={hasAddition}
              subtractionEnabled={hasSubtraction}
              onToggle={togglePattern}
            />
          </SectionCard>

          <div className="grid gap-3 sm:grid-cols-2">
            <SectionCard title="3. 做几道题？">
              <QuestionCountSelector value={count} onChange={setCount} />
            </SectionCard>

            <SectionCard title="4. 题目怎么出现？" hint="可多选">
              <div className="grid grid-cols-3 gap-2">
                {FORMAT_OPTIONS.map((f) => {
                  const active = formats.includes(f.id)
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleFormat(f.id)}
                      className={[
                        'flex min-h-12 items-center justify-center gap-1.5 rounded-2xl border-2 px-2 py-2 text-sm font-bold transition',
                        active
                          ? 'border-sky bg-sky-soft/50 text-sky-deep shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-sky/40',
                      ].join(' ')}
                    >
                      <span aria-hidden="true">{f.emoji}</span>
                      {f.label}
                    </button>
                  )
                })}
              </div>
            </SectionCard>
          </div>

          <SectionCard title="学习小帮手" hint="孩子可以在做题时随时打开">
            <HintSettings
              autoShowVisualHint={autoShowVisualHint}
              showHintAfterWrongAnswer={showHintAfterWrong}
              onChangeAutoShow={setAutoShow}
              onChangeAfterWrong={setAfterWrong}
            />
          </SectionCard>

          <button
            type="button"
            onClick={() => setAdvancedOpen(true)}
            className="flex w-full items-center justify-between rounded-3xl bg-white/75 px-5 py-3.5 text-left shadow-soft ring-1 ring-white/80 transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/40"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-500">
                <Sparkles size={20} />
              </span>
              <span>
                <span className="block text-base font-extrabold text-slate-700">难度细分</span>
                <span className="block text-xs font-medium text-slate-400">
                  {skillTags.length > 0 ? `已选择 ${skillTags.length} 个专项技能` : '进阶设置，可按专项技能出题'}
                </span>
              </span>
            </span>
            <ChevronRight size={22} className="text-slate-400" />
          </button>
        </main>
      </div>

      <AdvancedSettingsDrawer
        open={advancedOpen}
        skillTags={skillTags}
        onClose={() => setAdvancedOpen(false)}
        onToggleSkill={toggleSkill}
        onClear={() => setSkillTags([])}
      />

      {/* 手机 / 竖屏使用底部主操作，横屏则放在任务总览中。 */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#e9f6ff] via-[#e9f6ff]/95 to-transparent px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-8 sm:px-6 ipad-land:hidden">
        <div className="mx-auto max-w-2xl">
          {!canStart && (
            <p className="mb-2 text-center text-sm font-medium text-coral ipad-land:mb-1">
              请至少选择一个练习范围和对应的题型
            </p>
          )}
          <motion.button
            type="button"
            disabled={!canStart}
            whileTap={canStart ? { scale: 0.96 } : undefined}
            onClick={handleStart}
            className={startButtonClass}
          >
            <Rocket size={25} />
            开始练习
          </motion.button>
          {history.lastWrongQuestions.length > 0 && (
            <button
              type="button"
              onClick={onPracticeWrong}
              className="mt-2 flex w-full items-center justify-center gap-2 py-1 text-sm font-bold text-sky-deep"
            >
              <BookOpen size={17} /> 错题加练 · {history.lastWrongQuestions.length} 题
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number | string
  label: string
}) {
  return (
    <div className="rounded-2xl bg-white/15 px-2 py-3 text-center ring-1 ring-white/15">
      <span className="flex items-center justify-center gap-1 text-lg font-extrabold">
        {icon} {value}
      </span>
      <span className="mt-0.5 block text-[11px] font-semibold text-white/70">{label}</span>
    </div>
  )
}
