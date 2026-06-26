import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket } from 'lucide-react'
import type {
  PracticeSettings,
  QuestionCount,
  QuestionPattern,
  RangeType,
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
import { SectionCard } from '@/components/common/SectionCard'

interface SetupScreenProps {
  initialSettings: PracticeSettings
  totalStars: number
  onStart: (settings: PracticeSettings) => void
}

function isAddition(range: RangeType) {
  return range.startsWith('addition')
}

export function SetupScreen({
  initialSettings,
  totalStars,
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
    })
  }

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col gap-5 px-4 pb-32 sm:px-6 ipad-land:max-w-4xl">
      <MascotHeader totalStars={totalStars} />

      {/* 选项卡片：横屏双列减少滚动 */}
      <div className="grid gap-5 ipad-land:grid-cols-2 ipad-land:items-start">
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
      </div>

      {/* 底部固定开始按钮 */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-white/40 bg-gradient-to-t from-white/95 to-white/70 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur sm:px-6">
        <div className="mx-auto max-w-2xl ipad-land:max-w-4xl">
          {!canStart && (
            <p className="mb-2 text-center text-sm font-medium text-coral">
              请至少选择一个练习范围和对应的题型
            </p>
          )}
          <motion.button
            type="button"
            disabled={!canStart}
            whileTap={canStart ? { scale: 0.96 } : undefined}
            onClick={handleStart}
            className={[
              'flex w-full items-center justify-center gap-3 rounded-full py-5 text-2xl font-extrabold text-white shadow-soft transition',
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
