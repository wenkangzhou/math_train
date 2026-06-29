import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type {
  PracticeResult,
  PracticeSettings,
  Question,
  StoredHistory,
} from '@/types/math'
import { generateQuestions } from '@/lib/questionGenerator'
import {
  DEFAULT_SETTINGS,
  loadHistory,
  loadSettings,
  recordPractice,
  saveSettings,
} from '@/lib/storage'
import { resultLevel } from '@/lib/difficulty'
import { SetupScreen, type StartSettings } from '@/components/setup/SetupScreen'
import { PracticeScreen } from '@/components/practice/PracticeScreen'
import { ResultScreen } from '@/components/result/ResultScreen'

type Screen = 'setup' | 'practice' | 'result'

// 练习设置（含第二版的题型格式与细分技能）
type ActiveSettings = PracticeSettings &
  Partial<Pick<StartSettings, 'questionFormats' | 'skillTags'>>

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [settings, setSettings] = useState<ActiveSettings>(DEFAULT_SETTINGS)
  const [questions, setQuestions] = useState<Question[]>([])
  const [result, setResult] = useState<PracticeResult | null>(null)
  const [history, setHistory] = useState<StoredHistory>(() => loadHistory())

  // 初始化：读取本地设置与累计星星
  useEffect(() => {
    setSettings(loadSettings())
    setHistory(loadHistory())
  }, [])

  const startWith = useCallback(
    (s: ActiveSettings, qs: Question[]) => {
      saveSettings(s)
      setSettings(s)
      setQuestions(qs)
      setResult(null)
      setScreen('practice')
    },
    [],
  )

  // 从设置页开始
  const handleStart = useCallback(
    (s: StartSettings) => {
      startWith(s, generateQuestions(s))
    },
    [startWith],
  )

  // 练习完成 → 统计 + 写入本地 → 结果页
  const handleComplete = useCallback((res: PracticeResult) => {
    const level = resultLevel(res.accuracy)
    const history = recordPractice({
      entry: {
        date: Date.now(),
        total: res.total,
        correct: res.correctCount,
        stars: res.stars,
        bestStreak: res.bestStreak,
        accuracy: res.accuracy,
      },
      earnedStars: res.stars,
      wrongQuestions: res.wrongQuestions,
    })
    setHistory(history)
    setResult(res)
    setScreen('result')
    void level
  }, [])

  // 退出练习，回到设置
  const handleExit = useCallback(() => {
    setScreen('setup')
  }, [])

  // 结果页操作
  const handleReplay = useCallback(() => {
    // 同样设置，重新生成新题
    startWith(settings, generateQuestions(settings))
  }, [settings, startWith])

  const handlePracticeWrong = useCallback(() => {
    if (!result || result.wrongQuestions.length === 0) return
    // 用错题原样再练一遍（重新洗一下顺序）
    const shuffled = [...result.wrongQuestions].sort(() => Math.random() - 0.5)
    startWith(settings, shuffled)
  }, [result, settings, startWith])

  const handlePracticeSavedWrong = useCallback(() => {
    if (history.lastWrongQuestions.length === 0) return
    const shuffled = [...history.lastWrongQuestions].sort(
      () => Math.random() - 0.5,
    )
    startWith(settings, shuffled)
  }, [history.lastWrongQuestions, settings, startWith])

  const handleReconfigure = useCallback(() => {
    setScreen('setup')
  }, [])

  return (
    <div className="min-h-full w-full px-safe">
      <AnimatePresence mode="wait">
        {screen === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <SetupScreen
              initialSettings={settings}
              history={history}
              onStart={handleStart}
              onPracticeWrong={handlePracticeSavedWrong}
            />
          </motion.div>
        )}

        {screen === 'practice' && (
          <motion.div
            key="practice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <PracticeScreen
              questions={questions}
              settings={settings}
              onComplete={handleComplete}
              onExit={handleExit}
            />
          </motion.div>
        )}

        {screen === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ResultScreen
              result={result}
              totalStars={history.totalStars}
              onReplay={handleReplay}
              onPracticeWrong={handlePracticeWrong}
              onReconfigure={handleReconfigure}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
