import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, ChevronRight } from 'lucide-react'
import type {
  PracticeSettings,
  QuestionCount,
  QuestionFormat,
  QuestionPattern,
  RangeType,
  SkillTag,
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

export type StartSettings = PracticeSettings & {
  questionFormats: QuestionFormat[]
  skillTags: SkillTag[]
}

interface SetupScreenProps {
  initialSettings: PracticeSettings
  onStart: (settings: StartSettings) => void
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
  onStart,
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
  const [formats, setFormats] = useState<QuestionFormat[]>(['equation'])
  const [skillTags, setSkillTags] = useState<SkillTag[]>([])
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

  return (
    <div className="mx-auto max-w-2xl px-4 pb-40 pt-2 sm:px-6 ipad-land:max-w-4xl ipad-land:pb-32">
      <MascotHeader />

      {/* 选项卡片：横屏双列，统一拉伸高度 */}
      <div className="grid gap-2 ipad-land:grid-cols-2 ipad-land:gap-2">
        <SectionCard title="今天想练什么？" hint="可多选">
          <RangeSelector selected={ranges} onToggle={toggleRange} />
        </SectionCard>

        <SectionCard title="题目长什么样？" hint="可多选">
          <PatternSelector
            selected={patterns}
            additionEnabled={hasAddition}
            subtractionEnabled={hasSubtraction}
            onToggle={togglePattern}
          />
        </SectionCard>

        <SectionCard title="做几道题？">
          <QuestionCountSelector value={count} onChange={setCount} />
        </SectionCard>

        <SectionCard title="需要小帮手吗？">
          <HintSettings
            autoShowVisualHint={autoShowVisualHint}
            showHintAfterWrongAnswer={showHintAfterWrong}
            onChangeAutoShow={setAutoShow}
            onChangeAfterWrong={setAfterWrong}
          />
        </SectionCard>

        <SectionCard title="题目怎么出现？" hint="可多选">
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map((f) => {
              const active = formats.includes(f.id)
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFormat(f.id)}
                  className={[
                    'flex items-center gap-1.5 rounded-2xl border-2 px-4 py-2.5 text-base font-bold transition ipad-land:px-3 ipad-land:py-2 ipad-land:text-sm',
                    active
                      ? 'border-sky bg-sky-soft/50 text-sky-deep'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-sky/40',
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

      {/* 高级设置：难度细分入口 */}
      <div className="mt-3 rounded-card bg-white/70 shadow-soft ipad-land:mt-2">
        <button
          type="button"
          onClick={() => setAdvancedOpen(true)}
          className="flex w-full items-center justify-between px-5 py-4 text-left ipad-land:px-4 ipad-land:py-3"
        >
          <span className="text-lg font-bold text-slate-700">
            难度细分
            {skillTags.length > 0 && (
              <span className="ml-2 rounded-full bg-grass px-2 py-0.5 text-xs font-bold text-white">
                已选 {skillTags.length}
              </span>
            )}
          </span>
          <ChevronRight
            size={22}
            className="text-slate-400"
          />
        </button>
      </div>

      <AdvancedSettingsDrawer
        open={advancedOpen}
        skillTags={skillTags}
        onClose={() => setAdvancedOpen(false)}
        onToggleSkill={toggleSkill}
        onClear={() => setSkillTags([])}
      />

      {/* 底部开始按钮：固定在底部，透明背景 */}
      <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 sm:px-6">
        <div className="mx-auto max-w-2xl ipad-land:max-w-4xl">
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
            className={[
              'flex w-full items-center justify-center gap-3 rounded-full py-5 text-2xl font-extrabold text-white shadow-soft transition ipad-land:py-4 ipad-land:text-xl',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/60',
              canStart
                ? 'bg-gradient-to-r from-coral to-amber-400 hover:brightness-105'
                : 'cursor-not-allowed bg-slate-300',
            ].join(' ')}
          >
            <Rocket size={28} />
            开始练习
          </motion.button>
        </div>
      </div>
    </div>
  )
}
