import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { PracticeResult, PracticeSettings, Question } from '@/types/math'
import { generateQuestions } from '@/lib/questionGenerator'
import {
  DEFAULT_SETTINGS,
  loadHistory,
  loadSettings,
  recordPractice,
  saveSettings,
} from '@/lib/storage'
import { resultLevel } from '@/lib/difficulty'
import { SetupScreen } from '@/components/setup/SetupScreen'
import { PracticeScreen } from '@/components/practice/PracticeScreen'
import { ResultScreen } from '@/components/result/ResultScreen'

type Screen = 'setup' | 'practice' | 'result'

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [settings, setSettings] = useState<PracticeSettings>(DEFAULT_SETTINGS)
  const [questions, setQuestions] = useState<Question[]>([])
  const [result, setResult] = useState<PracticeResult | null>(null)
  const [totalStars, setTotalStars] = useState(0)

  // 初始化：读取本地设置与累计星星
  useEffect(() => {
    setSettings(loadSettings())
    setTotalStars(loadHistory().totalStars)
  }, [])

  const startWith = useCallback(
    (s: PracticeSettings, qs: Question[]) => {
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
    (s: PracticeSettings) => {
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
    setTotalStars(history.totalStars)
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
              totalStars={totalStars}
              onStart={handleStart}
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
              totalStars={totalStars}
              onReplay={handleReplay}
              onPracticeWrong={handlePracticeWrong}
              onReconfigure={handleReconfigure}
              onHome={handleReconfigure}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
